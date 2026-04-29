"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, ChevronRight, Star, RotateCcw, CheckCircle2 } from "lucide-react";
import { learningExercises, LearningExercise as IExercise } from "@/mock-data/phonetics";
import LoadingIndicator from "./LoadingIndicator";
import { useApp } from "@/contexts/AppContext";

interface ScoreResult {
  overall: number;
  pronunciation: number;
  rhythm: number;
  intonation: number;
}

function generatePracticeScore(seedText: string, recordingTime: number): ScoreResult {
  const seed = Array.from(seedText).reduce((total, char) => total + char.charCodeAt(0), 0) + recordingTime * 11;
  const base = 68 + (seed % 24);
  const pronunciation = Math.min(98, Math.max(55, base + ((seed % 9) - 4)));
  const rhythm = Math.min(98, Math.max(55, base + (((seed >> 1) % 11) - 5)));
  const intonation = Math.min(98, Math.max(55, base + (((seed >> 2) % 13) - 6)));
  const overall = Math.round((pronunciation + rhythm + intonation) / 3);
  return {
    overall,
    pronunciation,
    rhythm,
    intonation,
  };
}

export default function LearningExercise() {
  const { showNotification } = useApp();
  const [selectedExercise, setSelectedExercise] = useState<IExercise>(learningExercises[0]);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [sessionScores, setSessionScores] = useState<number[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number>(0);

  const currentSentence = selectedExercise.sentences[sentenceIndex];
  const isLastSentence = sentenceIndex === selectedExercise.sentences.length - 1;

  useEffect(() => {
    return () => {
      window.clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      showNotification("This browser does not support microphone practice mode.", "error");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      streamRef.current = stream;
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        analyzeRecording();
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => setRecordingTime((time) => time + 1), 1000);
    } catch {
      showNotification("Microphone access is required for practice mode.", "error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    window.clearInterval(timerRef.current);
  };

  const analyzeRecording = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setScore(null);

    const interval = window.setInterval(() => {
      setAnalysisProgress((progress) => {
        if (progress >= 95) {
          window.clearInterval(interval);
          window.setTimeout(() => {
            const result = generatePracticeScore(currentSentence, recordingTime);
            setScore(result);
            setSessionScores((previous) => [...previous, result.overall]);
            setIsAnalyzing(false);
            showNotification(`Practice scored ${result.overall}%`, "success");
          }, 200);
          return 95;
        }

        return progress + Math.random() * 15 + 5;
      });
    }, 120);
  };

  const nextSentence = () => {
    if (!isLastSentence) {
      setSentenceIndex((index) => index + 1);
      setScore(null);
    }
  };

  const resetExercise = () => {
    setSentenceIndex(0);
    setScore(null);
    setSessionScores([]);
    setRecordingTime(0);
    setIsAnalyzing(false);
    setAnalysisProgress(0);
  };

  const avgScore = sessionScores.length
    ? Math.round(sessionScores.reduce((total, value) => total + value, 0) / sessionScores.length)
    : null;

  const scoreColor = (value: number) => (value >= 80 ? "#10b981" : value >= 65 ? "#f59e0b" : "#ef4444");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {learningExercises.map((exercise) => (
          <button
            key={exercise.id}
            onClick={() => {
              setSelectedExercise(exercise);
              setSentenceIndex(0);
              setScore(null);
              setSessionScores([]);
            }}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedExercise.id === exercise.id
                ? "border-[#6366f1] bg-[#6366f1]/10"
                : "border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5"
            }`}
          >
            <div className="text-2xl mb-2">{exercise.icon}</div>
            <div className={`text-sm font-semibold ${selectedExercise.id === exercise.id ? "text-[#6366f1]" : "text-slate-200"}`}>
              {exercise.title}
            </div>
            <div className="text-xs text-slate-500 mt-1">{exercise.description}</div>
            <div className="text-xs text-slate-600 mt-2">Target: {exercise.targetScore}%</div>
          </button>
        ))}
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-slate-200 font-semibold">{selectedExercise.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sentence {sentenceIndex + 1} of {selectedExercise.sentences.length}
            </p>
          </div>
          {avgScore !== null && (
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: scoreColor(avgScore) }}>
                {avgScore}
              </div>
              <div className="text-xs text-slate-500">Avg Score</div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          {selectedExercise.sentences.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                index < sentenceIndex
                  ? "bg-green-500"
                  : index === sentenceIndex
                    ? "bg-[#6366f1]"
                    : "bg-white/10"
              }`}
            />
          ))}
        </div>

        <div className="p-5 rounded-xl bg-white/3 border border-white/8 mb-5 text-center">
          <p className="text-2xl font-medium text-slate-100 leading-relaxed">{currentSentence}</p>
          <p className="text-sm text-slate-500 mt-2">Read this sentence aloud using {selectedExercise.icon} accent</p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-4">
          {!isRecording && !isAnalyzing && (
            <button
              onClick={startRecording}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#ec4899] text-white font-semibold hover:opacity-90 transition-all glow-primary"
            >
              <Mic className="w-5 h-5" />
              Record Practice
            </button>
          )}
          {isRecording && (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 font-semibold"
            >
              <Square className="w-5 h-5 fill-current" />
              Stop ({recordingTime}s)
            </button>
          )}
          {score && !isLastSentence && (
            <button
              onClick={nextSentence}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 font-medium"
            >
              Next Sentence
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={resetExercise}
            className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 transition-all"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {isAnalyzing && (
          <div className="mb-4 fade-in">
            <LoadingIndicator progress={analysisProgress} label="Analyzing pronunciation..." variant="bar" />
          </div>
        )}

        {score && !isAnalyzing && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 fade-in">
            {[
              { label: "Overall", value: score.overall },
              { label: "Pronunciation", value: score.pronunciation },
              { label: "Rhythm", value: score.rhythm },
              { label: "Intonation", value: score.intonation },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="p-3 rounded-xl text-center border"
                style={{
                  background: scoreColor(value) + "12",
                  borderColor: scoreColor(value) + "30",
                }}
              >
                <div className="text-2xl font-bold" style={{ color: scoreColor(value) }}>
                  {value}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{label}</div>
                <div className="flex justify-center gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-2.5 h-2.5"
                      style={{ color: star <= Math.round(value / 20) ? scoreColor(value) : "#334155" }}
                      fill={star <= Math.round(value / 20) ? scoreColor(value) : "none"}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {score && isLastSentence && (
          <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3 fade-in">
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
            <div>
              <p className="text-green-300 font-semibold">Exercise Complete!</p>
              <p className="text-green-600 text-sm">Average score: {avgScore} / 100</p>
            </div>
            <button
              onClick={resetExercise}
              className="ml-auto px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-sm hover:bg-green-500/30 transition-all"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
