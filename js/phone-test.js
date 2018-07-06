
var bluetoothDevice = null;
var microbitUUID = 'e95d0000-251d-470a-a062-fa1922dfa9a8';
var accUUID = 'e95d0753-251d-470a-a062-fa1922dfa9a8';
var accCharUUID = 'e95dca4b-251d-470a-a062-fa1922dfa9a8'
var accPeriod = 'e95dfb24-251d-470a-a062-fa1922dfa9a'
var AccelerometerCharacteristic = null;
var accData = new Int16Array(3);
var primaryServer;

function onButtonClick() {
  navigator.bluetooth.requestDevice({
      // filters: [{
      //   services: ['battery_service']
      // }],
      acceptAllDevices: true,
      optionalServices: []
    })
    .then(device => device.gatt.connect())
    .then(server => {
      // Getting Battery Service...
      return server.getPrimaryService('battery_service');
    })
    .then(service => {
      // Getting Battery Level Characteristic...
      return service.getCharacteristic('battery_level');
    })
    .then(characteristic => {
      // Reading Battery Level...
      return characteristic.readValue();
    })
    .then(value => {
      console.log(value);
    })
    .catch(error => {
      console.log(error);
    });
}
