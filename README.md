# Oracle SSH

Sets up a Oracle connection inside an SSH tunnel.



## API

### `.connect(obj sshConfig, obj oracleConfig)`

* `sshConfig` should be an object according to the `ssh2` package.
* `oracleConfig` should be an object according to the `oracle` package.
* Returns a Object, containing a `client` from the `oracle` package and `close` function.


## Usage
Don't forget to `close()` the tunnel connection when you're done with oracle.
This is a working example put only your configuration and run example.js

```javascript
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
// Call function
init();

```
