
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { 
  Mic, 
  MicOff, 
  Volume2,
  Droplets,
  MessageSquare,
  Plus,
  BarChart3,
  Home,
  CheckCircle
} from 'lucide-react';

interface VoiceCommandProps {
  isListening: boolean;
  onToggleListening: () => void;
}

export const VoiceCommand: React.FC<VoiceCommandProps> = ({ isListening, onToggleListening }) => {
  const navigate = useNavigate();
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef<any>(null);

  const commands = [
    {
      patterns: ['water all plots', 'start watering', 'water everything'],
      action: () => {
        // Water all plots command
        // In production, this would trigger actual watering
        speak('Starting to water all plots now');
        return 'Watering all plots';
      }
    },
    {
      patterns: ['water plot', 'water garden', 'water tomato', 'water herbs'],
      action: (transcript: string) => {
        const plotMatch = transcript.match(/(tomato|herb|pepper|lettuce)/i);
        const plotName = plotMatch ? plotMatch[1] : 'selected plot';
        // Water specific plot command
        speak(`Starting to water ${plotName} now`);
        return `Watering ${plotName}`;
      }
    },
    {
      patterns: ['open chat', 'ask ai', 'garden assistant', 'help me'],
      action: () => {
        navigate('/chat');
        speak('Opening AI garden assistant');
        return 'Opening AI chat';
      }
    },
    {
      patterns: ['go home', 'open dashboard', 'show dashboard'],
      action: () => {
        navigate('/app');
        speak('Opening dashboard');
        return 'Opening dashboard';
      }
    },
    {
      patterns: ['add plot', 'new plot', 'create plot'],
      action: () => {
        navigate('/app/add-plot');
        speak('Opening add plot wizard');
        return 'Creating new plot';
      }
    },
    {
      patterns: ['show analytics', 'view reports', 'show stats'],
      action: () => {
        navigate('/app/analytics');
        speak('Opening analytics');
        return 'Opening analytics';
      }
    },
    {
      patterns: ['check weather', 'weather forecast', 'show weather'],
      action: () => {
        navigate('/weather');
        speak('Opening weather forecast');
        return 'Opening weather';
      }
    },
    {
      patterns: ['stop watering', 'pause watering', 'turn off water'],
      action: () => {
        // Stop watering command
        speak('Stopping all watering activities');
        return 'Stopping watering';
      }
    }
  ];

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const processVoiceCommand = (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();
    
    for (const command of commands) {
      for (const pattern of command.patterns) {
        if (lowerTranscript.includes(pattern)) {
          setIsProcessing(true);
          setTimeout(() => {
            const result = command.action(transcript);
            setLastCommand(result);
            setIsProcessing(false);
          }, 500);
          return;
        }
      }
    }
    
    // No command matched
    speak("I didn't understand that command. Try saying 'water all plots' or 'open chat'");
    setLastCommand('Command not recognized');
  };

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      // Speech recognition not supported
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      // Voice recognition started
    };

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          setConfidence(confidence);
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript && finalTranscript.length > 3) {
        processVoiceCommand(finalTranscript);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      // Speech recognition error
      onToggleListening();
    };

    recognitionRef.current.onend = () => {
      // Voice recognition ended
      if (isListening) {
        // Restart recognition if we're still supposed to be listening
        setTimeout(() => {
          if (recognitionRef.current && isListening) {
            recognitionRef.current.start();
          }
        }, 100);
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      if (isListening) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          // Error starting recognition
        }
      } else {
        recognitionRef.current.stop();
        setTranscript('');
      }
    }
  }, [isListening]);

  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-6 z-40">
      {/* Voice Command Button */}
      <Button
        onClick={onToggleListening}
        className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isListening ? (
          <MicOff className="w-6 h-6 text-white" />
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}
      </Button>

      {/* Voice Recognition UI */}
      {(isListening || transcript || lastCommand) && (
        <Card className="absolute bottom-16 right-0 w-80 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-4">
            {/* Status */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {isListening ? (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-red-600">Listening...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Voice Commands</span>
                  </>
                )}
              </div>
              {confidence > 0 && (
                <Badge variant="outline" className="text-xs">
                  {Math.round(confidence * 100)}% confidence
                </Badge>
              )}
            </div>

            {/* Transcript */}
            {transcript && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-1">You said:</p>
                <p className="text-sm font-medium text-gray-900 bg-gray-50 p-2 rounded">
                  "{transcript}"
                </p>
              </div>
            )}

            {/* Processing */}
            {isProcessing && (
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-blue-600">Processing command...</span>
              </div>
            )}

            {/* Last Command */}
            {lastCommand && !isProcessing && (
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">{lastCommand}</span>
              </div>
            )}

            {/* Quick Commands */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium">Try saying:</p>
              <div className="flex flex-wrap gap-1">
                {[
                  'Water all plots',
                  'Open chat',
                  'Show weather',
                  'Add new plot'
                ].map((command, index) => (
                  <Badge key={index} variant="secondary" className="text-xs cursor-pointer hover:bg-blue-100">
                    "{command}"
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
