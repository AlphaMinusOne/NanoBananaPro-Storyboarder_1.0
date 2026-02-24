import React, { useState, useRef } from 'react';
import { generateStoryboard, fileToBase64 } from './services/geminiService';
import { StoryboardResponse, GridSize, Language, Shot } from './types';
import { GRID_OPTIONS } from './constants';
import ShotCard from './components/ShotCard';
import { 
    LayoutGrid, 
    Languages, 
    Upload, 
    Wand2, 
    Copy, 
    CheckCircle, 
    Loader2,
    FileText,
    Image as ImageIcon
} from 'lucide-react';

const App: React.FC = () => {
  // State
  const [script, setScript] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [gridSize, setGridSize] = useState<GridSize>(3); // Default 3x3 (9)
  const [language, setLanguage] = useState<Language>('en');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<StoryboardResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGenerate = async () => {
    if (!script.trim()) {
        setError("请输入剧本或大纲。");
        return;
    }
    if (!imageFile) {
        setError("请上传参考图以保持风格一致。");
        return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const base64 = await fileToBase64(imageFile);
      const data = await generateStoryboard(script, base64, gridSize, language);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "发生了未知错误。");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateShot = (index: number, newShot: Shot) => {
    if (!result) return;
    const newShots = [...result.shots];
    newShots[index] = newShot;
    setResult({ ...result, shots: newShots });
  };

  const handleCopyJson = () => {
    if (!result) return;
    const suffix = "以参考图为主体，注意环境的空间布局，空间中人物与所有内容物品的相对位置， 并生成不同角度的符合剧情发展的连贯性分镜图，注意一定要保持与图片美术风格的一致，给出图片";
    const content = JSON.stringify(result, null, 2) + "\n\n" + suffix;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Dynamic Grid Style
  const getGridStyle = () => {
    return {
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        gap: '1rem',
    };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-banana-500 selection:text-slate-900">
      
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-banana-500 p-2 rounded-lg text-slate-900">
                <LayoutGrid size={24} strokeWidth={2.5} />
            </div>
            <div>
                <h1 className="text-xl font-bold text-slate-100 leading-tight">NanoBananaPro</h1>
                <p className="text-xs text-slate-400">分镜提示词生成器</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
                onClick={() => setLanguage(prev => prev === 'en' ? 'zh' : 'en')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 text-sm font-medium"
            >
                <Languages size={16} className="text-banana-400" />
                {language === 'en' ? '输出语言：英文' : '输出语言：中文'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Panel: Inputs */}
        <div className="lg:col-span-3 space-y-6">
            
            {/* Config Section */}
            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-lg">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <LayoutGrid size={16} /> 网格设置
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-500 mb-1.5">网格布局</label>
                        <select 
                            value={gridSize}
                            onChange={(e) => setGridSize(Number(e.target.value) as GridSize)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:border-banana-500 focus:outline-none transition-all"
                        >
                            {(Object.keys(GRID_OPTIONS) as unknown as GridSize[]).map((size) => (
                                <option key={size} value={size}>{GRID_OPTIONS[size]}</option>
                            ))}
                        </select>
                        <p className="text-[10px] text-slate-500 mt-1 text-right">
                           总计: {gridSize * gridSize} 个分镜
                        </p>
                    </div>
                </div>
            </div>

            {/* Script Input */}
            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-lg flex flex-col h-[300px]">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FileText size={16} /> 剧本
                </h2>
                <textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="在此处粘贴您的剧本..."
                    className="flex-grow w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 placeholder:text-slate-600 focus:border-banana-500 focus:outline-none resize-none"
                />
            </div>

            {/* Image Input */}
            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-lg">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ImageIcon size={16} /> 参考图
                </h2>
                
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        relative group cursor-pointer border-2 border-dashed rounded-lg h-40 flex flex-col items-center justify-center transition-all overflow-hidden
                        ${imagePreview ? 'border-banana-500/50' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'}
                    `}
                >
                    {imagePreview ? (
                        <>
                            <img src={imagePreview} alt="Reference" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="bg-slate-900/80 text-white px-3 py-1 rounded text-xs">更换图片</span>
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-4">
                            <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                            <p className="text-xs text-slate-400">点击上传参考图</p>
                        </div>
                    )}
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                />
            </div>

            {/* Generate Button */}
            <button
                onClick={handleGenerate}
                disabled={loading}
                className={`
                    w-full py-4 rounded-xl font-bold text-slate-900 flex items-center justify-center gap-2 transition-all shadow-lg
                    ${loading 
                        ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
                        : 'bg-gradient-to-r from-banana-400 to-banana-500 hover:from-banana-300 hover:to-banana-400 hover:shadow-banana-500/20 active:scale-[0.98]'
                    }
                `}
            >
                {loading ? (
                    <><Loader2 className="animate-spin" size={20} /> 生成中...</>
                ) : (
                    <><Wand2 size={20} /> 生成提示词</>
                )}
            </button>

            {error && (
                <div className="p-3 bg-red-900/20 border border-red-800/50 rounded-lg text-red-400 text-xs text-center">
                    {error}
                </div>
            )}
        </div>

        {/* Right Panel: Results */}
        <div className="lg:col-span-9 flex flex-col gap-6">
            
            {/* Toolbar if Result Exists */}
            {result && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
                   <div>
                        <h3 className="font-bold text-slate-200">生成的网格: {result.grid_layout}</h3>
                        <p className="text-xs text-slate-500">在下方编辑单个分镜或复制完整 JSON。</p>
                   </div>
                   <button
                    onClick={handleCopyJson}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
                        ${copied ? 'bg-green-600 text-white' : 'bg-slate-800 text-banana-400 hover:bg-slate-700'}
                    `}
                   >
                    {copied ? <CheckCircle size={16}/> : <Copy size={16}/>}
                    {copied ? '已复制 JSON！' : '复制 JSON'}
                   </button>
                </div>
            )}

            {/* Grid Visualization */}
            <div className="flex-grow bg-slate-900/50 rounded-xl border border-slate-800/50 p-6 min-h-[500px] overflow-x-auto">
                {result ? (
                    <div style={getGridStyle()} className="w-full min-w-[600px]">
                        {result.shots.map((shot, idx) => (
                            <ShotCard 
                                key={idx} 
                                shot={shot} 
                                index={idx} 
                                onUpdate={handleUpdateShot} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                        <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                            <LayoutGrid size={40} className="opacity-20" />
                        </div>
                        <p className="text-sm">准备生成您的分镜网格。</p>
                        <div className="flex gap-4 text-xs opacity-50">
                            <span className="flex items-center gap-1"><CheckCircle size={10} /> 5x5 网格</span>
                            <span className="flex items-center gap-1"><CheckCircle size={10} /> 风格一致</span>
                            <span className="flex items-center gap-1"><CheckCircle size={10} /> JSON 输出</span>
                        </div>
                    </div>
                )}
            </div>

             {/* Raw JSON Preview (Collapsed by default logic or bottom area) */}
             {result && (
                <div className="bg-slate-950 rounded-xl border border-slate-800 p-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">原始 JSON 预览</h4>
                    <pre className="text-[10px] text-slate-400 font-mono bg-slate-900 p-4 rounded-lg overflow-x-auto max-h-40">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>

      </main>
    </div>
  );
};

export default App;