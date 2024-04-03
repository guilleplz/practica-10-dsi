import net from 'net'

const ruta = process.argv[2];
const option = process.argv[3];

const client = new net.Socket();

// Conectar el cliente al servidor
const PORT = 60300;
const HOST = 'localhost';
client.connect(PORT, HOST, () => {
    console.log('Conectado al servidor');
    client.write(`${ruta} ${option}`);
});

client.on('data', (data) => {
    console.log(`Respuesta del servidor:\n${data.toString()}`);
    client.destroy();
});

// Manejar errores
client.on('error', (error) => {
    console.error(`Error en el cliente: ${error.message}`);
});

client.on('close', () => {
    console.log('Conexión cerrada');
});