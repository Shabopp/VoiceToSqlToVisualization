import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Send, AlertCircle, Volume2, FileText, Zap, Brain, Cpu, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import ReactTypingEffect from 'react-typing-effect';
import { useDatabase } from '../context/DatabaseContext';
import ProcessingOverlay from './ProcessingOverlay';
import toast from 'react-hot-toast';

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState('');
  const [transcription, setTranscription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [waveformData, setWaveformData] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [showProcessingOverlay, setShowProcessingOverlay] = useState(false);
  const [currentProcessingStep, setCurrentProcessingStep] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [showTranscription, setShowTranscription] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  const { connectionStatus, setQueryResults, setLastQuery, dbConfig } = useDatabase();
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  const processingSteps = ['upload', 'transcribe', 'generate', 'visualize', 'complete'];

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const generateWaveform = () => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setAudioLevel(average);
      
      const waveData = Array.from({ length: 40 }, (_, i) => {
        const index = Math.floor((i / 40) * dataArray.length);
        return (dataArray[index] / 255) * 100;
      });
      setWaveformData(waveData);
    } else {
      // Fallback animation
      const data = Array.from({ length: 40 }, () => Math.random() * 100);
      setWaveformData(data);
      setAudioLevel(Math.random() * 100);
    }
    
    if (isRecording) {
      animationRef.current = requestAnimationFrame(generateWaveform);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });
      
      // Set up audio analysis
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setAudioURL(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) audioContextRef.current.close();
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      generateWaveform();

      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('🎤 Recording started');
    } catch (error) {
      toast.error('Failed to start recording: ' + error.message);
      console.error('❌ Recording error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(intervalRef.current);
      cancelAnimationFrame(animationRef.current);
      setWaveformData([]);
      setAudioLevel(0);
      
      toast.success('⏹️ Recording stopped');
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioURL('');
    setTranscription('');
    setIsPlaying(false);
    setRecordingTime(0);
    setWaveformData([]);
    setProcessingStep('');
    setShowTranscription(false);
    toast.success('🔄 Recording reset');
  };

  const processTranscription = async () => {
    if (!audioBlob) {
      toast.error('No audio recording found');
      return;
    }

    if (connectionStatus !== 'connected') {
      toast.error('Please connect to database first');
      return;
    }

    if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
      toast.error('Database configuration is incomplete');
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 800));

    setIsUploading(true);
    setIsProcessing(true);
    setShowProcessingOverlay(true);
 
    
    try {
      // Step 1: Upload audio
      setCurrentProcessingStep('upload');
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const uploadResponse = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(errorText || 'Upload failed');
      }

      const uploadData = await uploadResponse.json();
      
      // Step 2: Transcription
      setCurrentProcessingStep('transcribe');
      // await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing time
      
      setTranscription(uploadData.transcription);
      setShowTranscription(true);
      
      // Step 3: Generate SQL
      setCurrentProcessingStep('generate');
      const processResponse = await fetch('http://localhost:5000/process-transcription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcription: uploadData.transcription,
          dbConfig: dbConfig,
        }),
      });

       if (!processResponse.ok) {
  let errorMessage = 'Failed to process query';
  try {
    const errorData = await processResponse.json();
    errorMessage = errorData.message || errorMessage;
  } catch {
    const errorText = await processResponse.text();
    errorMessage = errorText || errorMessage;
  }
  throw new Error(errorMessage);
}


      const resultData = await processResponse.json();

      if (!resultData.sql_query) {
        toast.error('Could not generate SQL query from transcription');
        return;
      }

      // Step 4: Visualize
      setCurrentProcessingStep('visualize');
      // await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 5: Complete
      setCurrentProcessingStep('complete');
      // await new Promise(resolve => setTimeout(resolve, 500));

      setQueryResults({
        sql: resultData.sql_query,
        data: resultData.results || [],
        vizType: resultData.viz_type || 'table',
        executionTime: '0.042s',
        rowCount: resultData.results ? resultData.results.length : 0,
        explanation: resultData.explanation
      });
      
      setLastQuery({
        query: uploadData.transcription,
        timestamp: new Date().toISOString(),
        executionTime: '0.042s'
      });
      
      toast.success(`✅ Query processed! Found ${resultData.results?.length || 0} results`);
      
    } catch (error) {
      console.error('❌ Processing error:', error);
      toast.error('Failed to process query: ' + error.message);
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
      setTimeout(() => {
        setShowProcessingOverlay(false);
        setCurrentProcessingStep('');
      }, 1000);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <ProcessingOverlay
        isVisible={showProcessingOverlay}
        currentStep={currentProcessingStep}
        steps={processingSteps}
      />
      
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="p-6 max-w-5xl mx-auto"
      >
        {/* AI Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center"
            >
              <Brain className="w-6 h-6 text-white" />
            </motion.div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Talk to Your Database
            </h1>
          </div>
          <p className="text-gray-400 text-lg tracking-wide">
             From Voice to Insight — End-to-End AI Data Interface
          </p>
        </motion.div>

        {/* Main AI Interface */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative bg-black/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-cyan-500/20 overflow-hidden"
        >
          {/* Animated Grid Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
          </div>

          {/* Glowing Border Animation */}
          <motion.div
            className="absolute inset-0 rounded-3xl"
            animate={{
              background: [
                "linear-gradient(0deg, rgba(0,255,255,0.3), rgba(138,43,226,0.3), rgba(0,255,255,0.3))",
                "linear-gradient(120deg, rgba(0,255,255,0.3), rgba(138,43,226,0.3), rgba(0,255,255,0.3))",
                "linear-gradient(240deg, rgba(0,255,255,0.3), rgba(138,43,226,0.3), rgba(0,255,255,0.3))",
                "linear-gradient(360deg, rgba(0,255,255,0.3), rgba(138,43,226,0.3), rgba(0,255,255,0.3))"
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            style={{
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "xor",
              padding: "2px"
            }}
          />

          {/* AI Status Bar */}
          <div className="relative z-10 px-8 py-4 border-b border-cyan-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-3 h-3 rounded-full ${
                      connectionStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'
                    }`}
                  />
                  <span className="text-cyan-400 font-mono text-sm">
                    DB_STATUS: {connectionStatus.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-400 font-mono text-sm">
                    
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 font-mono text-sm">
                  AI_CORE: ONLINE
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 p-8">
            {/* Connection Status Warning */}
            <AnimatePresence>
              {connectionStatus !== 'connected' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-2xl border border-red-500/30 flex items-center gap-3 backdrop-blur-sm"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: 3 }}
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  </motion.div>
                  <div>
                    <p className="text-red-300 font-bold">
                      [WARNING] DATABASE CONNECTION REQUIRED
                    </p>
                    <p className="text-red-400 text-sm font-mono">
                      ESTABLISH DB CONNECTION TO ACTIVATE NEURAL PROCESSING
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Recording Interface */}
            <div className="flex flex-col items-center space-y-8">
              {/* AI Core Button */}
              <div className="relative">
                <motion.button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={connectionStatus !== 'connected' || isProcessing}
                  className={`relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 ${
                    connectionStatus !== 'connected' || isProcessing
                      ? 'opacity-50 cursor-not-allowed' 
                      : ''
                  }`}
                  whileHover={connectionStatus === 'connected' && !isProcessing ? { scale: 1.05 } : {}}
                  whileTap={connectionStatus === 'connected' && !isProcessing ? { scale: 0.95 } : {}}
                >
                  {/* Rotating Outer Ring */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 p-[4px]"
                  >
                    <div className="w-full h-full rounded-full bg-black/80" />
                  </motion.div>

                  {/* Inner Glow */}
                  <motion.div
                    animate={isRecording ? { 
                      boxShadow: [
                        "0 0 20px rgba(255,0,100,0.5)",
                        "0 0 40px rgba(255,0,100,0.8)",
                        "0 0 20px rgba(255,0,100,0.5)"
                      ]
                    } : {
                      boxShadow: [
                        "0 0 20px rgba(0,255,255,0.3)",
                        "0 0 30px rgba(0,255,255,0.5)",
                        "0 0 20px rgba(0,255,255,0.3)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-4 rounded-full bg-gradient-to-br from-black via-gray-900 to-black border border-cyan-500/30"
                  />
                  
                  {/* Button Icon */}
                  <div className="relative z-10 flex flex-col items-center">
                    {isRecording ? (
                      <>
                        <Square className="w-8 h-8 text-red-400 mb-2" />
                        <span className="text-red-400 font-mono text-xs">STOP</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-8 h-8 text-cyan-400 mb-2" />
                        <span className="text-cyan-400 font-mono text-xs">SPEAK</span>
                      </>
                    )}
                  </div>
                  
                  {/* Pulse Rings */}
                  {isRecording && (
                    <>
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-red-400/50"
                        animate={{ scale: [1, 1.5, 2], opacity: [0.8, 0.3, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-pink-400/30"
                        animate={{ scale: [1, 1.8, 2.5], opacity: [0.6, 0.2, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      />
                    </>
                  )}
                </motion.button>
              </div>

              {/* AI Status Display */}
             
              {/* Advanced Waveform */}
              {/*
               <AnimatePresence>
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="w-full max-w-2xl"
                  >
                    <div className="bg-black/50 rounded-2xl p-6 border border-cyan-500/20">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-cyan-400" />
                          <span className="text-cyan-400 font-mono text-sm">AUDIO_ANALYSIS</span>
                        </div>
                        <div className="text-cyan-400 font-mono text-xs">
                          44.1kHz | 16-bit | MONO
                        </div>
                      </div>
                      
                      <div className="flex items-end justify-center space-x-1 h-24">
                        {waveformData.map((height, index) => (
                          <motion.div
                            key={index}
                            className="bg-gradient-to-t from-cyan-500 via-blue-400 to-purple-500 rounded-full min-h-[4px]"
                            style={{ width: '4px' }}
                            animate={{ height: `${Math.max(height, 10)}%` }}
                            transition={{ duration: 0.1 }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence> */}
            </div>

            {/* AI Control Panel */}
            <AnimatePresence>
              {audioURL && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  className="mt-8 space-y-6"
                >
                  <div className="bg-black/50 rounded-2xl p-6 border border-cyan-500/20">
                    <div className="flex items-center justify-center space-x-6 mb-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={isPlaying ? pauseAudio : playAudio}
                        className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-200"
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6 text-cyan-400" />
                        ) : (
                          <Play className="w-6 h-6 text-cyan-400 ml-0.5" />
                        )}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05, rotate: 180 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={resetRecording}
                        disabled={isProcessing}
                        className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-400/50 disabled:opacity-50 transition-all duration-200"
                      >
                        <RotateCcw className="w-6 h-6 text-purple-400" />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={processTranscription}
                        disabled={isProcessing || isUploading || connectionStatus !== 'connected'}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600/80 to-emerald-600/80 hover:from-green-500/80 hover:to-emerald-500/80 disabled:from-gray-600/50 disabled:to-gray-500/50 text-white font-mono font-bold rounded-xl transition-all duration-300 disabled:cursor-not-allowed border border-green-500/30"
                      >
                        <Send className="w-5 h-5" />
                        {isUploading ? 'UPLOADING...' : isProcessing ? 'PROCESSING...' : 'VISUALIZE'}
                      </motion.button>
                    </div>

                    {/* <audio
                      ref={audioRef}
                      src={audioURL}
                      onEnded={() => setIsPlaying(false)}
                      className="w-full rounded-xl bg-black/50 border border-cyan-500/20"
                      controls
                    /> */}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Transcription Display */}
            <AnimatePresence>
              {transcription && showTranscription && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.95 }}
                  className="mt-8 bg-black/50 rounded-2xl border border-green-500/30 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 px-6 py-4 border-b border-green-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="font-mono font-bold text-green-400">
                        [AI_TRANSCRIPTION_OUTPUT]
                      </h3>
                      <motion.div
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="ml-auto text-green-400 font-mono text-xs"
                      >
                        PROCESSING...
                      </motion.div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-green-300 text-lg leading-relaxed font-mono">
                      <ReactTypingEffect
                        text={transcription}
                        speed={50}
                        eraseDelay={999999}
                        typingDelay={500}
                        cursor="▊"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default VoiceRecorder;