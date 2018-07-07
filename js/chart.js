google.charts.load('current', {
  'packages': ['corechart']
});

var bluetoothDevice = null;
var versionNumber = '1.23.11' ;
var microbitUUID = 'e95d0000-251d-470a-a062-fa1922dfa9a8';
var accServiceUUID = 'e95d0753-251d-470a-a062-fa1922dfa9a8';
var accDataUUID = 'e95dca4b-251d-470a-a062-fa1922dfa9a8'
var accPeriod = 'e95dfb24-251d-470a-a062-fa1922dfa9a8'
var AccelerometerData = null;
var AccelerometerPeriod = null;
var AccelerometerService = null;
var accData = [
  ['Time', 'X', 'Y', 'Z']
];
var gattServer;
var data_container = document.querySelector('.data-container');
var reading = false;
var AccelerometerGraph = document.getElementById('curve_chart');
var graphUpdate;
AccelerometerGraph.setAttribute('hidden', true);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('../Roulette/service-worker.js')
    .then(function() {
      console.log('Service Worker Registered');
    });
}
if(!'bluetooth' in navigator){
  alert('Please enable Web Bluetooth by going to chrome://flags/#enable-web-bluetooth');
}
function onConnectClick() {
  navigator.bluetooth.requestDevice({
      filters: [{
        namePrefix: 'BBC micro:bit',
      }],
      optionalServices: [accServiceUUID]
    })
    .then(device => {
      console.log(device.name);
      bluetoothDevice = device;
      bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);
      return bluetoothDevice.gatt.connect();
    })
    .then(server => {
      console.log('Found GATT Server');
      gattServer = server;
      console.log(gattServer);
      return gattServer.getPrimaryService(accServiceUUID);
    })
    .then(service => {
      AccelerometerService = service;
      document.getElementById('connectButton').innerHTML = "Connected";
      document.getElementById('disconnectButton').innerHTML = "Disconnect";
    })
}

function onButtonClick() {
  if (reading) {
    AccelerometerData.stopNotifications();
    clearInterval(graphUpdate);
    document.getElementById('startButton').innerHTML = "Read";
    reading = false;
  } else {
    reading = true;
    graphUpdate = setInterval(function() {
      AccelerometerGraph.removeAttribute('hidden');
      google.charts.setOnLoadCallback(drawChart);
    }, 20);
    AccelerometerGraph.removeAttribute('hidden');
    return (AccelerometerService ? Promise.resolve() : onConnectClick())
      .then(_ => {
        console.log('Found Data Characteristic');
        return AccelerometerService.getCharacteristic(accDataUUID);
      })
      .then(characteristic => {
        AccelerometerData = characteristic;
        AccelerometerData.startNotifications();
        AccelerometerData.addEventListener('characteristicvaluechanged', handleValueChange);
        document.getElementById('startButton').innerHTML = "Stop Reading...";
        console.log('Reading Accelerometer...');
      })
      .catch(error => {
        console.log('Argh! ' + error);
      });
  }
}

function onPeriodButtonClick() {
  return (AccelerometerService ? Promise.resolve() : onConnectClick())
    .then(_ => {
      console.log('Found Period Characteristic');
      return AccelerometerService.getCharacteristic(accPeriod);
    })
    .then(characteristic => {
      AccelerometerPeriod = characteristic;
      return AccelerometerPeriod.readValue();
    })
    .then(value => {
      console.log('Accelerometer period is: ' + value.getUint8(0));
    })
    .catch(error => {
      console.log('Argh! ' + error);
    });
}

function setPeriodTo1() {
  return (AccelerometerService ? Promise.resolve() : onConnectClick())
    .then(_ => {
      console.log('Found Period Characteristic');
      return AccelerometerService.getCharacteristic(accPeriod);
    })
    .then(characteristic => {
      AccelerometerPeriod = characteristic;
      return AccelerometerPeriod.writeValue(Uint16Array.of(1));
    })
    .then(_ => {
      return AccelerometerPeriod.readValue();
    })
    .then(value => {
      console.log('New Accelerometer period is: ' + value.getUint8(0));
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
  document.getElementById('startButton').innerHTML = "Read";

}

function handleValueChange(event) {
  var millis = Date.now();
  timeStamp = new Date(millis);
  console.log(timeStamp);

  AcceleratorX = event.target.value.getInt16(0, 1);
  console.log('x: ' + AcceleratorX);

  AcceleratorY = event.target.value.getInt16(2, 1);
  console.log('y: ' + AcceleratorY);

  AcceleratorZ = event.target.value.getInt16(4, 1);
  console.log('z: ' + AcceleratorZ);

  var accItem = [timeStamp, AcceleratorX, AcceleratorY, AcceleratorZ];
  accData.push(accItem);

  data_container.innerHTML =
    '<p> Acceleration X: ' + AcceleratorX + '</p>' +
    '<p> Acceleration Y: ' + AcceleratorY + '</p>' +
    '<p> Acceleration Z: ' + AcceleratorZ + '</p>';

}

function onLogButton() {
  console.log(accData);
  google.charts.setOnLoadCallback(drawChart);
  // data_container.innerHTML = "";
  // for (let i = 0; i < accData.length; i++) {
  //   data_container.innerHTML = data_container.innerHTML + '<p>';
  //   for (let j = 1; j < 4; j++) {
  //     switch (j) {
  //       case 1:
  //         data_container.innerHTML = data_container.innerHTML + 'x: ';
  //         break;
  //       case 2:
  //         data_container.innerHTML = data_container.innerHTML + 'y: ';
  //         break;
  //       case 3:
  //         data_container.innerHTML = data_container.innerHTML + 'z: ';
  //         break;
  //       default:
  //         data_container.innerHTML = data_container.innerHTML + 'Error';
  //     }
  //     data_container.innerHTML = data_container.innerHTML + accData[i][j] + ' ';
  //   }
  //   data_container.innerHTML = data_container.innerHTML + '</p>';
  // }
}

function onClearButton() {
  accData = [
    ['Time', 'X', 'Y', 'Z']
  ];
  AccelerometerGraph.setAttribute('hidden', true);
  data_container.innerHTML = '';
}

function drawChart() {
  var data = google.visualization.arrayToDataTable(accData);

  var options = {
    title: 'Accelerometer',
    curveType: 'none',
    legend: {
      position: 'bottom'
    }
  };

  chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

  chart.draw(data, options);
}
