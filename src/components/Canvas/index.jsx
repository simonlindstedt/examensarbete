import Pixi from '../../Classes/Pixi';
import React, { useRef, useEffect, useState } from 'react';
import Button from '../Button';
import SideMenu from '../SideMenu';
import RangeInput from '../RangeInput';
import SettingsPanel from '../SettingsPanel';
import Mediator from '../../Classes/Mediator';
import SequencerPanel from '../SequencerPanel';
import DrumPanel from '../DrumPanel';
import { StyledButtonContainer, CanvasWrapper, StyledText } from './styles';
import HelpButton from '../HelpButton';

const mediator = new Mediator();
const pixi = new Pixi(mediator);

const Canvas = () => {
  const canvasRef = useRef();
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [box, setBox] = useState();
  const [isZero, setIsZero] = useState(false);
  const [oldValue, setOldValue] = useState();
  const [tempo, setTempo] = useState(pixi.clock.tempo);
  const [sequencerStates, setSequencerStates] = useState();
  const [helpIsActive, setHelpIsActive] = useState(false);

  const handleMessages = (e) => {
    if (e.data.box) {
      setBox(e.data.box);
    }

    if (e.data.sequencerStates) {
      setSequencerStates(e.data.sequencerStates);
    }
  };
  const revertToPreviousVolume = () => {
    setVolume(oldValue);
    pixi.setMasterVolume(oldValue);
  };

  // On mount
  useEffect(() => {
    pixi.start(canvasRef.current);
    mediator.worker.addEventListener('message', handleMessages);
  }, []);

  useEffect(() => {
    if (playing) {
      pixi.pause();
    } else {
      pixi.play();
    }
  }, [playing]);

  useEffect(() => {
    if (box) {
      pixi.findAndChangeSettings(box);
    }
  }, [box]);

  useEffect(() => {
    if (volume > 0) {
      setIsZero(false);
      setOldValue(volume);
    }
  }, [volume]);

  return (
    <main>
      {box && box.type !== 'seq' && box.type !== 'drum' ? (
        <SettingsPanel box={box} setBox={setBox} />
      ) : null}
      {box && box.type === 'seq' ? (
        <SequencerPanel
          box={box}
          setBox={setBox}
          seqState={
            sequencerStates.find((item) => item.belongsTo === box.id)?.step
          }
        />
      ) : null}
      {box && box.type === 'drum' ? (
        <DrumPanel
          box={box}
          setBox={setBox}
          seqState={sequencerStates.filter((item) => item.belongsTo === box.id)}
        />
      ) : null}
      <CanvasWrapper ref={canvasRef}></CanvasWrapper>
      <SideMenu helpIsActive={helpIsActive} setHelpIsActive={setHelpIsActive}>
        <StyledButtonContainer>
          <StyledText>drag and drop to add to playground</StyledText>
          <Button
            handleMouseUp={(e) => {
              pixi.addBox('filter', e.clientX, e.clientY);
            }}
            isMovable={true}
            title="Filter"
          />
          <Button
            handleMouseUp={(e) => {
              pixi.addBox('osc', e.clientX, e.clientY);
            }}
            isMovable={true}
            title="Oscillator"
          />
          <Button
            handleMouseUp={(e) => {
              pixi.addBox('rec', e.clientX, e.clientY);
            }}
            isMovable={true}
            title="Recording"
          />
          <Button
            handleMouseUp={(e) => {
              pixi.addBox('reverb', e.clientX, e.clientY);
            }}
            isMovable={true}
            title="Reverb"
          />
          <Button
            handleMouseUp={(e) => {
              pixi.addBox('frequency-lfo', e.clientX, e.clientY);
            }}
            isMovable={true}
            title="Frequency LFO"
          />
          <Button
            handleMouseUp={(e) => {
              pixi.addBox('amplitude-lfo', e.clientX, e.clientY);
            }}
            isMovable={true}
            title="Amplitude LFO"
          />
          <Button
            handleMouseUp={(e) => {
              pixi.addBox('seq', e.clientX, e.clientY);
            }}
            isMovable={true}
            title="Sequencer"
          />
          <Button
            handleMouseUp={(e) => {
              pixi.addBox('drum', e.clientX, e.clientY);
            }}
            isMovable={true}
            title="Drumbox"
          />
          <Button
            handleMouseUp={(e) => {
              pixi.addBox('delay', e.clientX, e.clientY);
            }}
            isMovable={true}
            title="Delay"
          />
          <button
            onClick={() => {
              const preset = pixi.savePreset();
              const string =
                'data:text/json;charset=utf-8,' +
                encodeURIComponent(JSON.stringify(preset));
              const linkElement = document.createElement('a');
              linkElement.setAttribute('href', string);
              linkElement.setAttribute('download', 'preset.json');
              linkElement.click();
              linkElement.remove();
            }}
          >
            save preset
          </button>
          <label>
            load preset
            <input
              type="file"
              onInput={async (e) => {
                const file = e.target.files[0];
                const content = await file.text();
                pixi.loadPreset(JSON.parse(content));
              }}
            />
          </label>
          <HelpButton
            handleClick={() => {
              setHelpIsActive(true);
            }}
            title="Help?"
          />
        </StyledButtonContainer>
        <Button
          handleClick={() => {
            setPlaying(!playing);
          }}
          isMovable={false}
          title={playing ? 'Play' : 'Pause'}
          playing={playing}
        />
        <RangeInput
          handleChange={(e) => {
            setTempo(e.target.value);
            pixi.clock.setTempo(tempo);
          }}
          tempo={tempo}
          isMaster={false}
        />
        <RangeInput
          handleChange={(e) => {
            setVolume(e.target.value);
            pixi.setMasterVolume(volume);
          }}
          volume={volume}
          isMaster={true}
          isZero={isZero}
          handleClick={() => {
            setIsZero(!isZero);

            if (isZero) {
              revertToPreviousVolume();
            } else {
              setVolume(0);

              pixi.setMasterVolume(0);
            }
          }}
        />
      </SideMenu>
    </main>
  );
};

export default Canvas;
