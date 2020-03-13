const net = require('net');
const oracledb = require('oracledb');
const {Client} = require('ssh2');

const connectSSH = async (sshConfig) => {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn
            .on('ready', () => resolve(conn))
            .on('error', reject)
            .connect(sshConfig);
    });
};

const createServer = async (conn, oracleConfig) => {
    return new Promise((resolve, reject) => {
        const server = net.createServer(sock => {
            conn.forwardOut(sock.remoteAddress, sock.remotePort, oracleConfig.host, oracleConfig.port, (err, stream) => {
                if (err) {
                    sock.end();
                } else {
                    sock.pipe(stream).pipe(sock);
                }
            });
        });
        server.on('error', reject).listen(0, () => resolve(server));
    });
};

const closePoolAndExit = async ()=> {
    try {
        // Get the pool from the pool cache and close it when no
        // connections are in use, or force it closed after 10 seconds
        // If this hangs, you may need DISABLE_OOB=ON in a sqlnet.ora file
        await oracledb.getPool().close(10);
    } catch(err) {
        throw err;
    }
};

module.exports = {
    async connect(sshConfig, oracleConfig) {
        const conn = await connectSSH(sshConfig);
        const server = await createServer(conn, oracleConfig);
        const {user,password,database} = oracleConfig;

        const connection = await oracledb.createPool({
            user: user, // [username]
            password: password, // [password]
            connectString: `127.0.0.1:${server.address().port}/${database}`// [hostname]:[port]/[DB service name]
        });

        const client = await connection.getConnection();

        return {
            client,
            conn,
            server,
            close: async () => {
                await client.close();
                await closePoolAndExit();
                await server.close();
                await conn.end();
            },
        };
    },
};
