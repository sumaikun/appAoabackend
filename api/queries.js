module.exports = {
    //inicio de sesion admin
    admin_auth: 'Select * from usuario_desarrollo where usuario = ? and clave = ? ',
    //inicio de sesion usuario 
    user_auth: `Select id, nombre, email, celular, oficina from operario where usuario = ? and clave = ? and inactivo = 0 `,
    //obtener oficias activas
    get_actives_offices: `SELECT id,nombre as name,ciudad as code FROM oficina where activa = 1`,
    //obtener oficinas por sucursal
    get_offices_by_branch: `SELECT id,nombre as name,ciudad as code FROM oficina where sucursal = ? `,
    //obtener citas de entrega
    get_deliver_appointments: `SELECT c.id as citaid, c.oficina, c.placa, c.hora , c.fecha, c.fec_devolucion, s.asegurado_nombre, c.conductor, c.hora_devol, s.fotovh1_f,  s.fotovh2_f, s.fotovh3_f, s.fotovh4_f, s.img_odo_salida_f
    ,l.emblema_f, l.vgenerica, l.delineacion_n, c.dir_domicilio, c.tel_domicilio, c.dir_domiciliod, c.tel_domiciliod 
    FROM cita_servicio AS c INNER JOIN siniestro AS s ON c.siniestro = s.id INNER JOIN vehiculo as v on v.placa = c.placa Inner join linea_vehiculo as l on l.id = v.linea 
    INNER JOIN sin_autor AS a ON a.siniestro = s.id WHERE c.oficina in ? and c.fecha = ? and c.estado = "P" and a.estado = "A" 
    ORDER BY s.id DESC`,
    //obtener citas de devolución
    get_devol_appointments: `SELECT c.id as citaid, c.oficina, c.placa, c.hora , c.fecha, c.fec_devolucion, s.asegurado_nombre, c.conductor, c.hora_devol, s.fotovh1_f,  s.fotovh2_f, s.fotovh3_f, s.fotovh4_f, s.img_odo_salida_f 
    ,l.emblema_f, l.vgenerica, l.delineacion_n, c.dir_domicilio, c.tel_domicilio, c.dir_domiciliod, c.tel_domiciliod 
    FROM cita_servicio AS c INNER JOIN siniestro AS s ON c.siniestro = s.id INNER JOIN vehiculo as v on v.placa = c.placa Inner join linea_vehiculo as l on l.id = v.linea
    WHERE c.oficina in ? and c.fec_devolucion = ? AND c.estadod = "P" ORDER BY s.id DESC`,
    //citas de entrega entre fechas
    get_deliver_appointments_by_dates: `SELECT c.id as citaid, c.oficina, c.placa, c.hora , c.fecha, c.fec_devolucion, s.asegurado_nombre, c.conductor, c.hora_devol, s.fotovh1_f,  s.fotovh2_f, s.fotovh3_f, s.fotovh4_f, s.img_odo_salida_f 
    ,l.emblema_f, l.vgenerica, l.delineacion_n, c.dir_domicilio, c.tel_domicilio, c.dir_domiciliod, c.tel_domiciliod
    FROM cita_servicio AS c INNER JOIN siniestro AS s ON c.siniestro = s.id  
    INNER JOIN sin_autor AS a ON a.siniestro = s.id INNER JOIN vehiculo as v on v.placa = c.placa Inner join linea_vehiculo as l on l.id = v.linea
    WHERE c.oficina in ? and ( c.fecha between ? and ? ) and c.estado = "P" and a.estado = "A" 
    ORDER BY s.id DESC`,
    //obtener citas de devolución  entre fechas 
    get_devol_appointments_by_dates: `SELECT c.id as citaid, c.oficina, c.placa, c.hora , c.fecha, c.fec_devolucion, s.asegurado_nombre, c.conductor, c.hora_devol, s.fotovh1_f,  s.fotovh2_f, s.fotovh3_f, s.fotovh4_f, s.img_odo_salida_f 
    ,l.emblema_f, l.vgenerica, l.delineacion_n, c.dir_domicilio, c.tel_domicilio, c.dir_domiciliod, c.tel_domiciliod
    FROM cita_servicio AS c INNER JOIN siniestro AS s ON c.siniestro = s.id INNER JOIN vehiculo as v on v.placa = c.placa Inner join linea_vehiculo as l on l.id = v.linea
    WHERE c.oficina in ? and ( c.fec_devolucion between ? and ? ) AND c.estadod = "P" ORDER BY s.id DESC`,
    //obtener información especifica del siniestro
    get_siniester_info: `SELECT c.id as citaid,s.numero, a.nombre as aseguradora , s.asegurado_nombre, c.conductor, s.declarante_nombre, s.placa AS placaSiniestro
    , o.nombre AS oficina , c.placa AS placaEntregar, c.agendada_por, c.dias_servicio  FROM cita_servicio AS c INNER JOIN siniestro AS s 
    ON c.siniestro = s.id INNER JOIN aseguradora AS a ON s.aseguradora = a.id INNER JOIN oficina AS o ON c.oficina = o.id WHERE c.id in ? `,
    get_appointment_info:`SELECT * FROM cita_servicio  WHERE id = ? `,
    assign_operator_deliver: `UPDATE cita_servicio SET operario_domicilio = ? WHERE id = ?  `,
    assign_operator_devolution: `UPDATE cita_servicio SET operario_domiciliod = ? WHERE id = ?  `,
    get_operator_deliver: `SELECT operario_domicilio FROM cita_servicio  WHERE id = ?  `,
    get_operator_devolution: `SELECT operario_domiciliod FROM cita_servicio  WHERE id = ?  `,
    operator_row: `Select id, nombre, apellido from operario where id = ? `,
}