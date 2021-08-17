import {Pool} from 'pg';

const pool = new Pool({
    user: "whisper",
    host: "localhost",
    database: "fruits",
    password: "",
    port: 5432
});

export default pool;