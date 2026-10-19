/**
 * Tamil Speech-to-Text Controller
 * Supports real-time Tamil voice transcription with 'ta-IN' locale
 */

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export type SpeechCallback = (text: string, isFinal: boolean) => void;
export type SpeechStatusCallback = (isListening: boolean, error?: string) => void;

class SpeechToTextManager {
  private recognition: any = null;
  private isListening = false;
  private onResultCallback: SpeechCallback | null = null;
  private onStatusCallback: SpeechStatusCallback | null = null;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognitionClass) {
        this.recognition = new SpeechRecognitionClass();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'ta-IN'; // Tamil (India)

        this.recognition.onstart = () => {
          this.isListening = true;
          this.onStatusCallback?.(true);
        };

        this.recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            this.onResultCallback?.(finalTranscript, true);
          } else if (interimTranscript) {
            this.onResultCallback?.(interimTranscript, false);
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          this.isListening = false;
          let errorMessage = 'குரல் உள்ளீட்டில் பிழை ஏற்பட்டது';
          if (event.error === 'not-allowed') {
            errorMessage = 'மைக்ரோஃபோன் அனுமதி தேவை (Microphone permission denied)';
          } else if (event.error === 'no-speech') {
            errorMessage = 'குரல் கேட்கவில்லை, மீண்டும் முயற்சிக்கவும்';
          }
          this.onStatusCallback?.(false, errorMessage);
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.onStatusCallback?.(false);
        };
      }
    }
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public startListening(
    onResult: SpeechCallback,
    onStatus: SpeechStatusCallback
  ): boolean {
    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      onStatus(false, 'இந்த சாதனத்தில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை (Voice input not supported in this environment)');
      return false;
    }

    this.onResultCallback = onResult;
    this.onStatusCallback = onStatus;

    try {
      if (this.isListening) {
        this.recognition.stop();
      }
      this.recognition.start();
      return true;
    } catch (e: any) {
      console.error('Failed to start speech recognition:', e);
      onStatus(false, 'குரல் உள்ளீட்டைத் தொடங்க முடியவில்லை');
      return false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignored
      }
    }
    this.isListening = false;
    this.onStatusCallback?.(false);
  }
}

export const speechManager = new SpeechToTextManager();
