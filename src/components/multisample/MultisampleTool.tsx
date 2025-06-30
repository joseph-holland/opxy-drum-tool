import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { PresetNameSection } from '../common/PresetNameSection';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { RecordingModal } from '../common/RecordingModal';
import { GeneratePresetSection } from '../common/GeneratePresetSection';
import { ErrorDisplay } from '../common/ErrorDisplay';
import { MultisampleSampleTable } from './MultisampleSampleTable';
import { MultisamplePresetSettings } from './MultisamplePresetSettings';
import { VirtualMidiKeyboard } from './VirtualMidiKeyboard';
import { useFileUpload } from '../../hooks/useFileUpload';
import { usePatchGeneration } from '../../hooks/usePatchGeneration';
import { audioBufferToWav } from '../../utils/audio';


export function MultisampleTool() {
  const { state, dispatch } = useAppContext();
  const { handleMultisampleUpload, clearMultisampleFile } = useFileUpload();
  const { generateMultisamplePatchFile } = usePatchGeneration();
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const browseFilesRef = useRef<(() => void) | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, message: '', onConfirm: () => {} });
  const [recordingModal, setRecordingModal] = useState<{
    isOpen: boolean;
    targetIndex: number | null;
  }>({ isOpen: false, targetIndex: null });

  const [targetMidiNote, setTargetMidiNote] = useState<number | null>(null);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSampleRateChange = (value: string) => {
    dispatch({ type: 'SET_MULTISAMPLE_SAMPLE_RATE', payload: parseInt(value, 10) });
  };

  const handleBitDepthChange = (value: string) => {
    dispatch({ type: 'SET_MULTISAMPLE_BIT_DEPTH', payload: parseInt(value, 10) });
  };

  const handleChannelsChange = (value: string) => {
    dispatch({ type: 'SET_MULTISAMPLE_CHANNELS', payload: parseInt(value, 10) });
  };

  const handlePresetNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_MULTISAMPLE_PRESET_NAME', payload: e.target.value });
  };

  const handleFilesSelected = async (files: File[]) => {
    // Process files one by one
    for (const file of files) {
      await handleMultisampleUpload(file);
    }
  };

  const handleFileUpload = async (_index: number, file: File) => {
    try {
      await handleMultisampleUpload(file);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleClearSample = (index: number) => {
    setConfirmDialog({
      isOpen: true,
      message: 'are you sure you want to clear this sample?',
      onConfirm: () => {
        clearMultisampleFile(index);
        setConfirmDialog({ isOpen: false, message: '', onConfirm: () => {} });
      }
    });
  };

  const handleGeneratePatch = async () => {
    try {
      const patchName = state.multisampleSettings.presetName.trim() || 'multisample_patch';
      await generateMultisamplePatchFile(patchName);
    } catch (error) {
      console.error('Error generating patch:', error);
    }
  };

  const handleClearAll = () => {
    setConfirmDialog({
      isOpen: true,
      message: 'are you sure you want to clear all loaded samples?',
      onConfirm: () => {
        for (let i = state.multisampleFiles.length - 1; i >= 0; i--) {
          clearMultisampleFile(i);
        }
        setConfirmDialog({ isOpen: false, message: '', onConfirm: () => {} });
      }
    });
  };

  const handleResetAll = () => {
    setConfirmDialog({
      isOpen: true,
      message: 'are you sure you want to reset everything to defaults? this will clear all samples, reset preset name, and audio settings.',
      onConfirm: () => {
        // Clear all samples
        for (let i = state.multisampleFiles.length - 1; i >= 0; i--) {
          clearMultisampleFile(i);
        }
        
        // Reset preset name
        dispatch({ type: 'SET_MULTISAMPLE_PRESET_NAME', payload: '' });
        
        // Reset audio format settings to defaults (0 = original)
        dispatch({ type: 'SET_MULTISAMPLE_SAMPLE_RATE', payload: 0 });
        dispatch({ type: 'SET_MULTISAMPLE_BIT_DEPTH', payload: 0 });
        dispatch({ type: 'SET_MULTISAMPLE_CHANNELS', payload: 0 });
        
        setConfirmDialog({ isOpen: false, message: '', onConfirm: () => {} });
      }
    });
  };

  const handleOpenRecording = (targetIndex: number | null = null) => {
    setRecordingModal({ isOpen: true, targetIndex });
  };

  const handleCloseRecording = () => {
    setRecordingModal({ isOpen: false, targetIndex: null });
  };

  const handleSaveRecording = async (audioBuffer: AudioBuffer) => {
    try {
      // Convert AudioBuffer to File-like object for processing
      const numberOfChannels = audioBuffer.numberOfChannels;
      const length = audioBuffer.length;
      const sampleRate = audioBuffer.sampleRate;
      
      // Create a new buffer with the same properties
      const offlineContext = new OfflineAudioContext(numberOfChannels, length, sampleRate);
      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineContext.destination);
      source.start();
      
      const renderedBuffer = await offlineContext.startRendering();
      
      // Create a File-like object from the buffer
      const wavData = audioBufferToWav(renderedBuffer);
      const recordedFile = new File([wavData], 'recorded_sample.wav', { type: 'audio/wav' });
      
      // If a specific target index was set, upload to that slot
      if (recordingModal.targetIndex !== null) {
        await handleFileUpload(recordingModal.targetIndex, recordedFile);
      } else {
        // Just add to the end of the array
        await handleMultisampleUpload(recordedFile);
      }
    } catch (error) {
      console.error('Error saving recording:', error);
    }
  };



  const handleAudioFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset the input so the same file can be selected again
    event.target.value = '';

    if (targetMidiNote !== null) {
      try {
        await handleMultisampleUpload(file);
        // After upload, assign to the specific MIDI note
        const newIndex = state.multisampleFiles.length;
        dispatch({
          type: 'UPDATE_MULTISAMPLE_FILE',
          payload: {
            index: newIndex,
            updates: { rootNote: targetMidiNote }
          }
        });
        setTargetMidiNote(null);
      } catch (error) {
        console.error('Error uploading file for MIDI note assignment:', error);
        setTargetMidiNote(null);
      }
    }
  };

  const hasLoadedSamples = state.multisampleFiles.length > 0;
  const hasPresetName = state.multisampleSettings.presetName.trim().length > 0;
  const canGeneratePatch = hasLoadedSamples && hasPresetName;
  
  // Check if any settings have been changed from defaults
  const hasChangesFromDefaults = (
    hasLoadedSamples || // Any samples loaded
    hasPresetName || // Preset name entered
    state.multisampleSettings.sampleRate !== 0 || // Audio format changed
    state.multisampleSettings.bitDepth !== 0 ||
    state.multisampleSettings.channels !== 0
    // Note: Multisample preset settings are handled in MultisamplePresetSettings component
  );

  return (
    <div style={{ 
      fontFamily: '"Montserrat", "Arial", sans-serif',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* Header Section */}
      <PresetNameSection
        presetName={state.multisampleSettings.presetName}
        onPresetNameChange={handlePresetNameChange}
        sampleRate={state.multisampleSettings.sampleRate}
        bitDepth={state.multisampleSettings.bitDepth}
        channels={state.multisampleSettings.channels}
        onSampleRateChange={handleSampleRateChange}
        onBitDepthChange={handleBitDepthChange}
        onChannelsChange={handleChannelsChange}
        samples={state.multisampleFiles}
        inputId="preset-name-multi"
      />

      {/* Separate input for audio files from MIDI key clicks */}
      <input
        ref={audioFileInputRef}
        type="file"
        accept="audio/*,.wav"
        onChange={handleAudioFileImport}
        style={{ display: 'none' }}
      />

      {/* Virtual MIDI Keyboard Section */}
      <div style={{
        background: 'transparent',
        padding: isMobile ? '1rem 0.5rem' : '2rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ 
            margin: '0',
            color: '#222',
            fontSize: '1.25rem',
            fontWeight: '300',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            demo samples
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            fontSize: '0.875rem',
            color: '#666'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              fontWeight: '500'
            }}>
              <i className="fas fa-check-circle" style={{ color: '#666' }}></i>
              {state.multisampleFiles.filter(s => s.isLoaded).length} / 24 loaded
            </div>
          </div>
        </div>

        <ErrorDisplay message={state.error || ''} />

        <VirtualMidiKeyboard
          assignedNotes={state.multisampleFiles.map(file => file.rootNote).filter(note => note !== undefined)}
          loadedSamplesCount={state.multisampleFiles.length}
          onKeyClick={(midiNote) => {
            // Find and play the sample assigned to this MIDI note
            const sampleIndex = state.multisampleFiles.findIndex(file => file.rootNote === midiNote);
            if (sampleIndex !== -1 && state.multisampleFiles[sampleIndex].audioBuffer) {
              const sample = state.multisampleFiles[sampleIndex];
              const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
              const source = audioContext.createBufferSource();
              source.buffer = sample.audioBuffer;
              source.connect(audioContext.destination);
              source.start();
            }
          }}
          onUnassignedKeyClick={(midiNote) => {
            // Store the target MIDI note and open audio file browser
            setTargetMidiNote(midiNote);
            audioFileInputRef.current?.click();
          }}
          onKeyDrop={async (midiNote, files) => {
            // Handle drag and drop onto specific MIDI keys
            if (files.length > 0 && state.multisampleFiles.length < 24) {
              const file = files[0]; // Use first file
              await handleMultisampleUpload(file);
              // After upload, assign to the specific MIDI note
              const newIndex = state.multisampleFiles.length;
              dispatch({
                type: 'UPDATE_MULTISAMPLE_FILE',
                payload: {
                  index: newIndex,
                  updates: { rootNote: midiNote }
                }
              });
            }
          }}
        />
      </div>

      {/* Tabbed Content Area */}
      <div style={{ 
        flex: 1,
        padding: isMobile ? '0 0.5rem' : '0 2rem',
        marginBottom: '2rem'
      }}>
        {/* Sample Management Section */}
        <div style={{
          background: '#fff',
          borderRadius: '15px',
          padding: isMobile ? '1rem' : '2rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid #f0f0f0'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'flex-start',
            marginBottom: '1.5rem',
            gap: isMobile ? '1rem' : '0'
          }}>
            <h3 style={{ 
              margin: '0',
              color: '#222',
              fontSize: '1.25rem',
              fontWeight: '300',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              sample management
            </h3>
            <div style={{ 
              display: 'flex', 
              gap: '0.75rem', 
              flexWrap: 'wrap',
              justifyContent: isMobile ? 'center' : 'flex-start',
              alignSelf: isMobile ? 'stretch' : 'auto'
            }}>
              <button
                onClick={() => {
                  // Trigger the browse files function from MultisampleSampleTable
                  if (browseFilesRef.current) {
                    browseFilesRef.current();
                  }
                }}
                style={{
                  padding: '0.625rem 1.25rem',
                  border: 'none',
                  borderRadius: '3px',
                  backgroundColor: '#333',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  flex: isMobile ? '1' : 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#555';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#333';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <i className="fas fa-folder-open"></i>
                browse files
              </button>
              <button
                onClick={handleClearAll}
                disabled={!hasLoadedSamples}
                style={{
                  padding: '0.625rem 1.25rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '3px',
                  backgroundColor: '#fff',
                  color: hasLoadedSamples ? '#6b7280' : '#9ca3af',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: hasLoadedSamples ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  opacity: hasLoadedSamples ? 1 : 0.6,
                  flex: isMobile ? '1' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (hasLoadedSamples) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.borderColor = '#9ca3af';
                    e.currentTarget.style.color = '#374151';
                  }
                }}
                onMouseLeave={(e) => {
                  if (hasLoadedSamples) {
                    e.currentTarget.style.backgroundColor = '#fff';
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.color = '#6b7280';
                  }
                }}
              >
                <i className="fas fa-trash"></i>
                clear all
              </button>
            </div>
          </div>
          <MultisampleSampleTable 
            onFileUpload={handleFileUpload}
            onClearSample={handleClearSample}
            onRecordSample={handleOpenRecording}
            onFilesSelected={handleFilesSelected}
            onClearAll={handleClearAll}
            onBrowseFilesRef={browseFilesRef}
          />
        </div>
      </div>

      {/* Preset Settings Panel - Always Visible */}
      <div style={{
        background: '#fff',
        borderTop: '1px solid #e0e0e0',
        padding: '1.5rem 2rem'
      }}>
        <MultisamplePresetSettings />
      </div>

      {/* Footer - Generate Preset */}
      <GeneratePresetSection
        type="multisample"
        hasLoadedSamples={hasLoadedSamples}
        hasPresetName={hasPresetName}
        canGeneratePatch={canGeneratePatch}
        loadedSamplesCount={state.multisampleFiles.length}
        editedSamplesCount={0} // Multisample doesn't have individual sample editing yet
        presetName={state.multisampleSettings.presetName}
        hasChangesFromDefaults={hasChangesFromDefaults}
        onResetAll={handleResetAll}
        onGeneratePatch={handleGeneratePatch}
        isMobile={isMobile}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, message: '', onConfirm: () => {} })}
      />

      {/* Recording Modal */}
      <RecordingModal
        isOpen={recordingModal.isOpen}
        onClose={handleCloseRecording}
        onSave={handleSaveRecording}
        maxDuration={20}
      />


    </div>
  );
}