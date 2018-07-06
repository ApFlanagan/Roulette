// google.charts.load('current', {
//   'packages': ['corechart']
// });
// google.charts.setOnLoadCallback(drawChart);
var bluetoothDevice = null;
var microbitUUID = 'e95d0000-251d-470a-a062-fa1922dfa9a8';
var accUUID = 'e95d0753-251d-470a-a062-fa1922dfa9a8';
var accCharUUID = 'e95dca4b-251d-470a-a062-fa1922dfa9a8'
var accPeriod = 'e95dfb24-251d-470a-a062-fa1922dfa9a'
var AccelerometerCharacteristic = null;
var accData = new Int16Array(3);
var primaryServer;

function onConnectClick() {
  navigator.bluetooth.requestDevice({
      filters: [{
        namePrefix: 'BBC Mirco:bit',
      }]
    })
    .then(device => {
      // Human-readable name of the device.
      console.log(device.name);
      bluetoothDevice = device;
      bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);
      // Attempts to connect to remote GATT Server.
    })
    .then(connectDevice);
}


function connectDevice() {
  if (bluetoothDevice.gatt.connected && AccelerometerCharacteristic) {
    return Promise.resolve();
  }
  document.getElementById('connectButton').innerHTML = "Connecting...";
  return bluetoothDevice.gatt.connect()
    .then(server => {
      // Getting Accelerometer Service...
      primaryServer = server;
      return server.getPrimaryService(accCharUUID);
    })
    .then(service => {
      console.log('Accelerometer Data Characteristic:');
      // Getting Accelerometer Characteristic
      return service.getCharacteristic(accUUID);
    })
    .then(characteristic => {
      AccelerometerCharacteristic = characteristic;
      console.log('>>' + AccelerometerCharacteristic.uuid);
      document.getElementById('connectButton').innerHTML = "Connected";
      document.getElementById('disconnectButton').innerHTML = "Disconnect";
    });
}

function onButtonClick() {
  return (AccelerometerCharacteristic ? Promise.resolve() : onConnectClick())
    .then(_ => {
      document.getElementById('startButton').innerHTML = "Reading...";
      console.log('Reading Accelerometer...');
      return AccelerometerCharacteristic.readValue();
    })
    .then(value => {
      console.log(value);
      // accData[0] = value.getInt16(0, 1);
      // accData[1] = value.getInt16(1, 1);
      // accData[2] = value.getInt16(2, 1);
      // console.log(accData);
      document.getElementById('startButton').innerHTML = "Read";
    })
    .catch(error => {
      console.log('Argh! ' + error);
    });
}

function onPeriodButtonClick() {
  return (primaryServer ? Promise.resolve() : onConnectClick())
    .then(service => {
      console.log('Accelerometer Period Characteristic:');
      // Getting Accelerometer Characteristic
      return service.getCharacteristic(accPeriod);
    })
    .then(characteristic => {
      return characteristic.readValue();
    })
    .then(value => {
      console.log('Accelerometer period is: ' + value.getUint8(0));
    })
    .catch(error => {
      console.log('Argh! ' + error);
    });
}

function onDisconnectButton() {
  if (!bluetoothDevice) {
    console.log('No Device Found');
    return;
  }
  console.log('Disconnecting from Bluetooth Device...');
  if (bluetoothDevice.gatt.connected) {
    bluetoothDevice.gatt.disconnect();
  } else {
    console.log('> Bluetooth Device is already disconnected');
  }
}

function onDisconnected(event) {
  // Object event.target is Bluetooth Device getting disconnected.
  console.log('> Bluetooth Device disconnected');
  document.getElementById('disconnectButton').innerHTML = "Disconnected";
  document.getElementById('connectButton').innerHTML = "Connect";

}

// function drawChart() {
//   var data = google.visualization.arrayToDataTable([
//     ['Year', 'Sales', 'Expenses'],
//     ['2004', 1000, 400],
//     ['2005', 1170, 460],
//     ['2006', 660, 1120],
//     ['2007', 1030, 540]
//   ]);
//
//   var options = {
//     title: 'Accelerometer',
//     curveType: 'none',
//     legend: {
//       position: 'bottom'
//     }
//   };
//
//   var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));
//
//   chart.draw(data, options);
// }
