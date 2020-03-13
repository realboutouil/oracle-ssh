const Oracle = require("oracle-ssh");
const oracledb = require("oracledb");

async function init() {
    let connection;
    try {
        connection = await Oracle.connect(
            {
                host: '', // Your server host name
                port: 22, // Your server ssh port as default in ssh is 22
                user: '', // Your server username
                password: '' // Your server password
            },
            {
                host: "127.0.0.1", // Your database host in server as default is localhost
                port: 1521, // Your database port in server as default is 1521
                user: "", // Your database user
                password: "", // Your database password
                database: "" // Your database name
            }
        );
        // Now the pool is running, it can be used
        const sql = `SELECT sysdate FROM dual WHERE :b = 1`;
        const binds = [1];
        const options = {outFormat: oracledb.OUT_FORMAT_OBJECT};
        const result = await connection.client.execute(sql, binds, options);
        console.log(result);

    } catch (err) {
        console.error(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                throw err;
            }
        }
    }
}
init();
