import React, { useState } from 'react';
import { Upload, ImageIcon, RotateCcw, Download, Zap, Activity, TrendingUp, Sparkles } from 'lucide-react';

const ImageRestoration = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [noisyImage, setNoisyImage] = useState(null);
  const [restoredImage, setRestoredImage] = useState(null);
  const [noiseLevel, setNoiseLevel] = useState(30);
  const [missingPercent, setMissingPercent] = useState(20);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setOriginalImage(img);
          setNoisyImage(null);
          setRestoredImage(null);
          setStats(null);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const addNoiseAndMissing = () => {
    if (!originalImage) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    
    ctx.drawImage(originalImage, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * noiseLevel * 2;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    
    const totalPixels = (canvas.width * canvas.height);
    const missingPixels = Math.floor(totalPixels * missingPercent / 100);
    
    for (let i = 0; i < missingPixels; i++) {
      const idx = Math.floor(Math.random() * totalPixels) * 4;
      data[idx] = 0;
      data[idx + 1] = 0;
      data[idx + 2] = 0;
      data[idx + 3] = 255;
    }
    
    ctx.putImageData(imageData, 0, 0);
    setNoisyImage(canvas.toDataURL());
  };

  const performLeastSquaresRestoration = () => {
    if (!noisyImage) return;
    
    setProcessing(true);
    
    setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;
        
        const restored = new Uint8ClampedArray(data);
        const windowSize = 3;
        const offset = Math.floor(windowSize / 2);
        
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            
            if (data[idx] === 0 && data[idx + 1] === 0 && data[idx + 2] === 0) {
              let sumR = 0, sumG = 0, sumB = 0, count = 0;
              let sumWeights = 0;
              
              for (let dy = -offset; dy <= offset; dy++) {
                for (let dx = -offset; dx <= offset; dx++) {
                  const nx = x + dx;
                  const ny = y + dy;
                  
                  if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const nidx = (ny * width + nx) * 4;
                    
                    if (!(data[nidx] === 0 && data[nidx + 1] === 0 && data[nidx + 2] === 0)) {
                      const dist = Math.sqrt(dx * dx + dy * dy);
                      const weight = Math.exp(-dist * dist / 2);
                      
                      sumR += data[nidx] * weight;
                      sumG += data[nidx + 1] * weight;
                      sumB += data[nidx + 2] * weight;
                      sumWeights += weight;
                      count++;
                    }
                  }
                }
              }
              
              if (count > 0 && sumWeights > 0) {
                restored[idx] = Math.round(sumR / sumWeights);
                restored[idx + 1] = Math.round(sumG / sumWeights);
                restored[idx + 2] = Math.round(sumB / sumWeights);
              }
            } else {
              let sumR = 0, sumG = 0, sumB = 0;
              let sumWeights = 0;
              
              for (let dy = -offset; dy <= offset; dy++) {
                for (let dx = -offset; dx <= offset; dx++) {
                  const nx = x + dx;
                  const ny = y + dy;
                  
                  if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const nidx = (ny * width + nx) * 4;
                    
                    if (!(data[nidx] === 0 && data[nidx + 1] === 0 && data[nidx + 2] === 0)) {
                      const dist = Math.sqrt(dx * dx + dy * dy);
                      const weight = Math.exp(-dist * dist / 2);
                      
                      sumR += data[nidx] * weight;
                      sumG += data[nidx + 1] * weight;
                      sumB += data[nidx + 2] * weight;
                      sumWeights += weight;
                    }
                  }
                }
              }
              
              if (sumWeights > 0) {
                restored[idx] = Math.round(sumR / sumWeights);
                restored[idx + 1] = Math.round(sumG / sumWeights);
                restored[idx + 2] = Math.round(sumB / sumWeights);
              }
            }
          }
        }
        
        const origCanvas = document.createElement('canvas');
        const origCtx = origCanvas.getContext('2d');
        origCanvas.width = originalImage.width;
        origCanvas.height = originalImage.height;
        origCtx.drawImage(originalImage, 0, 0);
        const origData = origCtx.getImageData(0, 0, origCanvas.width, origCanvas.height).data;
        
        let mseNoisy = 0, mseRestored = 0;
        const pixelCount = width * height;
        
        for (let i = 0; i < data.length; i += 4) {
          const noisyDiff = Math.pow(data[i] - origData[i], 2) + 
                           Math.pow(data[i+1] - origData[i+1], 2) + 
                           Math.pow(data[i+2] - origData[i+2], 2);
          
          const restoredDiff = Math.pow(restored[i] - origData[i], 2) + 
                              Math.pow(restored[i+1] - origData[i+1], 2) + 
                              Math.pow(restored[i+2] - origData[i+2], 2);
          
          mseNoisy += noisyDiff;
          mseRestored += restoredDiff;
        }
        
        const rmseNoisy = Math.sqrt(mseNoisy / (pixelCount * 3));
        const rmseRestored = Math.sqrt(mseRestored / (pixelCount * 3));
        const improvement = ((rmseNoisy - rmseRestored) / rmseNoisy * 100).toFixed(2);
        
        setStats({
          rmseNoisy: rmseNoisy.toFixed(2),
          rmseRestored: rmseRestored.toFixed(2),
          improvement: improvement
        });
        
        const restoredImageData = new ImageData(restored, width, height);
        ctx.putImageData(restoredImageData, 0, 0);
        
        setRestoredImage(canvas.toDataURL());
        setProcessing(false);
      };
      img.src = noisyImage;
    }, 100);
  };

  const downloadImage = (imageData, filename) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = imageData;
    link.click();
  };

  const reset = () => {
    setOriginalImage(null);
    setNoisyImage(null);
    setRestoredImage(null);
    setStats(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob top-0 left-0"></div>
        <div className="absolute w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 top-0 right-0"></div>
        <div className="absolute w-96 h-96 bg-gray-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 bottom-0 left-1/2"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-800">
              Image Restoration Aljabar Linear
            </h1>
          </div>
          <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto">
            Rekonstruksi gambar menggunakan <span className="font-semibold text-blue-700">Least Squares Method</span> untuk mengembalikan gambar yang rusak akibat noise dan piksel hilang
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8 border border-gray-200">
          
          {/* Upload Section */}
          {!originalImage ? (
            <div className="mb-8">
              <label className="group relative flex flex-col items-center justify-center w-full h-64 md:h-80 border-3 border-dashed border-blue-300 rounded-2xl cursor-pointer hover:border-blue-500 transition-all duration-300 bg-blue-50 hover:bg-blue-100">
                <div className="flex flex-col items-center justify-center">
                  <div className="p-6 bg-blue-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-12 h-12 md:w-16 md:h-16 text-white" />
                  </div>
                  <p className="text-lg md:text-xl text-gray-800 font-bold mb-2">
                    Upload Gambar Anda
                  </p>
                  <p className="text-sm text-gray-600">
                    PNG, JPG, JPEG (Maks 10MB)
                  </p>
                  <div className="mt-4 px-6 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium">
                    Klik atau Drag & Drop
                  </div>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          ) : (
            <>
              {/* Controls */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-800">Parameter Kerusakan</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-gray-700">
                        Level Noise
                      </label>
                      <span className="px-3 py-1 bg-blue-600 rounded-full text-white text-sm font-bold">
                        {noiseLevel}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={noiseLevel}
                      onChange={(e) => setNoiseLevel(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Bersih</span>
                      <span>Sangat Noisy</span>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-gray-700">
                        Piksel Hilang
                      </label>
                      <span className="px-3 py-1 bg-blue-600 rounded-full text-white text-sm font-bold">
                        {missingPercent}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={missingPercent}
                      onChange={(e) => setMissingPercent(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Utuh</span>
                      <span>50% Hilang</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={addNoiseAndMissing}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Zap className="w-5 h-5" />
                    Rusak Gambar
                  </button>
                  
                  {noisyImage && (
                    <button
                      onClick={performLeastSquaresRestoration}
                      disabled={processing}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <Sparkles className="w-5 h-5" />
                      {processing ? 'Processing...' : 'Restore Sekarang'}
                    </button>
                  )}
                  
                  <button
                    onClick={reset}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 font-bold border border-gray-300"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Reset
                  </button>
                </div>
              </div>

              {/* Statistics */}
              {stats && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-6 h-6 text-blue-700" />
                    <h3 className="text-xl font-bold text-gray-800">Hasil Analisis Performa</h3>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm transform hover:scale-105 transition-transform">
                      <p className="text-sm text-gray-600 mb-2 font-medium">RMSE Gambar Rusak</p>
                      <p className="text-3xl md:text-4xl font-black text-blue-600">{stats.rmseNoisy}</p>
                      <p className="text-xs text-gray-500 mt-1">Error tinggi</p>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm transform hover:scale-105 transition-transform">
                      <p className="text-sm text-gray-600 mb-2 font-medium">RMSE Hasil Restore</p>
                      <p className="text-3xl md:text-4xl font-black text-blue-700">{stats.rmseRestored}</p>
                      <p className="text-xs text-gray-500 mt-1">Error berkurang</p>
                    </div>
                    <div className="bg-blue-600 rounded-xl p-5 border-2 border-blue-700 transform hover:scale-105 transition-transform">
                      <p className="text-sm text-blue-100 mb-2 font-medium">Peningkatan</p>
                      <p className="text-3xl md:text-4xl font-black text-white">+{stats.improvement}%</p>
                      <p className="text-xs text-blue-100 mt-1">Quality boost! 🎉</p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-700">
                      <strong className="text-gray-900">💡 Insight:</strong> Metode LSM berhasil memperbaiki gambar dengan mengurangi RMSE sebesar <strong className="text-blue-700">{stats.improvement}%</strong>. Semakin rendah RMSE, semakin mirip dengan gambar asli!
                    </p>
                  </div>
                </div>
              )}

              {/* Images Display */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Original */}
                <div className="group bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <h3 className="text-lg font-bold text-gray-800">Original</h3>
                  </div>
                  <div className="relative overflow-hidden rounded-xl shadow-md border border-gray-200">
                    <img
                      src={originalImage.src}
                      alt="Original"
                      className="w-full h-auto"
                    />
                  </div>
                </div>

                {/* Noisy */}
                {noisyImage && (
                  <div className="group bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <h3 className="text-lg font-bold text-gray-800">Gambar Rusak</h3>
                    </div>
                    <div className="relative overflow-hidden rounded-xl shadow-md border border-gray-200 mb-3">
                      <img
                        src={noisyImage}
                        alt="Noisy"
                        className="w-full h-auto"
                      />
                    </div>
                    <button
                      onClick={() => downloadImage(noisyImage, 'rusak.png')}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-medium shadow"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                )}

                {/* Restored */}
                {restoredImage && (
                  <div className="group bg-white rounded-2xl p-5 border-2 border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                      <h3 className="text-lg font-bold text-gray-800">✨ Hasil Restore</h3>
                    </div>
                    <div className="relative overflow-hidden rounded-xl shadow-md border-2 border-blue-400 mb-3">
                      <img
                        src={restoredImage}
                        alt="Restored"
                        className="w-full h-auto"
                      />
                      <div className="absolute top-2 right-2 px-3 py-1 bg-blue-600 rounded-full text-white text-xs font-bold">
                        RESTORED
                      </div>
                    </div>
                    <button
                      onClick={() => downloadImage(restoredImage, 'restored.png')}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>



        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>Kelompok 3 | Image Restoration Aljabar Linear</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default ImageRestoration;