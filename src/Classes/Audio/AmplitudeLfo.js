import audio from './Audio';

export default class AmplitudeLfo {
  constructor(rate, maxValue, type) {
    this.audio = audio;
    this.input = audio.context.createOscillator();
    this.input.type = type;
    this.output = audio.context.createGain();
    this.setRate(rate);
    this.setMaxValue(maxValue);
    this.input.connect(this.output);
    this.input.start();
  }

  connectTo(input) {
    this.output.connect(input.node.gain);
  }

  disconnectFrom(input) {
    this.output.disconnect(input.node.gain);
  }

  setRate(rate) {
    // this.input.frequency.setValueAtTime(rate, audio.context.currentTime);
    this.input.frequency.linearRampToValueAtTime(
      rate,
      audio.context.currentTime + 0.1
    );
  }

  setMaxValue(maxValue) {
    if (maxValue > 1) maxValue = 1;
    // this.output.gain.setValueAtTime(maxValue, audio.context.currentTime);
    this.output.gain.linearRampToValueAtTime(
      maxValue,
      audio.context.currentTime + 0.1
    );
  }

  setType(type) {
    this.input.type = type;
  }
}
