require('dotenv').config();
const Reserva = require('./models/reserva.model');
const db = require('./db');

async function testBloqueos() {
    try {
        console.log("--- INICIANDO TEST BLOQUEOS ---");

        // 1. Limpiar bloqueos prueba
        await db.query("DELETE FROM bloqueos WHERE motivo = 'TEST_BLOQUEO'");

        // 2. Crear un bloqueo para Mesa 1 HOY de 14:00 a 16:00
        const hoy = new Date().toISOString().split('T')[0];
        console.log(`Creando bloqueo para Mesa 1 el ${hoy} de 14:00 a 16:00`);

        await db.query(`
            INSERT INTO bloqueos (mesa_id, fecha, hora_inicio, hora_fin, motivo)
            VALUES (1, ?, '14:00', '16:00', 'TEST_BLOQUEO')
        `, [hoy]);

        // 3. Probar conflicto en horario bloqueado (15:00)
        console.log("Probando conflicto a las 15:00 (DEBERÍA DAR TRUE)...");
        const conflicto1 = await Reserva.existeConflicto({
            fecha: hoy,
            hora: '15:00',
            mesa_id: 1
        });
        console.log("Resultado 15:00:", conflicto1);

        // 4. Probar conflicto fuera de horario (17:00)
        console.log("Probando conflicto a las 17:00 (DEBERÍA DAR FALSE - si no hay reserva)...");
        const conflicto2 = await Reserva.existeConflicto({
            fecha: hoy,
            hora: '17:00',
            mesa_id: 1
        });
        console.log("Resultado 17:00:", conflicto2);

        // 5. Probar conflicto en otra mesa (Mesa 2) a la hora bloqueada (15:00)
        console.log("Probando conflicto Mesa 2 a las 15:00 (DEBERÍA DAR FALSE)...");
        const conflicto3 = await Reserva.existeConflicto({
            fecha: hoy,
            hora: '15:00',
            mesa_id: 2
        });
        console.log("Resultado Mesa 2:", conflicto3);

        // 6. Limpiar
        await db.query("DELETE FROM bloqueos WHERE motivo = 'TEST_BLOQUEO'");
        console.log("--- TEST FINALIZADO ---");
        process.exit();

    } catch (e) {
        console.error("ERROR EN TEST:", e);
        process.exit(1);
    }
}

testBloqueos();
