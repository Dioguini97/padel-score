export function useBluetoothButton({ onTeamA, onTeamB, onUndo }) {
  async function connect() {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: []
    });

    const server = await device.gatt.connect();

    console.log("Bluetooth connected", device.name);

    // ⚠️ aqui depende do device
    // normalmente tens characteristics com notifications
  }

  return { connect };
}