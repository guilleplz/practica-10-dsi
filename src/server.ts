import net from 'net'
import { spawn } from 'child_process'
import fs from 'fs';

const PORT = 60300;

/**
 * función que maneja la solicitud del cliente (hace cat y wc)
 * @param filePath ruta del archivo a leer
 * @param option opción para wc
 * @param connection conexión con el cliente
 */
function handleClientRequest(filePath: string, option:string, connection: net.Socket) {

    fs.access(filePath, fs.constants.F_OK, (error) => {
        if (error) {
            connection.end(`Error: el archivo ${filePath} no existe`);
        }

        const catProcess = spawn('cat', [filePath]);

        catProcess.stdout.on('data', (data) => {
            console.log(data.toString());
        });
    
        // Redirigir la salida de cat a wc
        const wcOption = option === 'lines' ? '-l' : option === 'words' ? '-w' : '-c';
        const wc = spawn('wc', [wcOption]);
        catProcess.stdout.pipe(wc.stdin);
    
            
        let result = '';
    
        wc.stdout.on('data', (data) => {
            result += data.toString();
        });
            
            
        catProcess.on('error', (error) => {
            connection.end(`Error en cat: ${error.message}`);
        });
            
        // Manejar errores en wc
        wc.on('error', (error) => {
            connection.end(`Error en wc: ${error.message}`);
        });
    
        console.log(result);
            
        wc.on('close', () => {
            // Enviar el resultado al cliente
            connection.write(result);
            connection.end();
        });
    });
}

// Crear el servidor
const server = net.createServer((connection) => {
    console.log('Cliente conectado.');

    // Manejar los datos recibidos del cliente
    connection.on('data', (data) => {
        const [filePath, option] = data.toString().trim().split(" ");
        console.log(`Solicitud para el archivo: ${filePath}`);

        handleClientRequest(filePath, option, connection);
    });

    connection.on('error', (error) => {
        console.error(`Error en el cliente: ${error.message}`);
    });

    connection.on('close', () => {
        console.log('Cliente desconectado.');
    });

    connection.write(`Connection established.\n`);
});

// Manejar errores en el servidor
server.on('error', (error) => {
    console.error(`Error en el servidor: ${error.message}`);
});

server.on('close', () => {
    console.log('Servidor cerrado.');
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});