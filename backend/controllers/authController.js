// backend/controllers/authController.js
import Usuario from "../models/Usuario.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { Op } from "sequelize";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

dotenv.config();

// 📅 Calcular edad
const calcularEdad = (fechaNacimiento) => {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
};

// ✅ REGISTRO DE USUARIO (solo mayores de edad)
export const registrarUsuario = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      dni,
      email,
      password,
      fechaNacimiento,
      celular,
      direccion,
      autorizacionDatos,
      aceptaPoliticas,
    } = req.body;

    // Validar campos obligatorios
    if (!nombre || !apellido || !dni || !email || !password || !fechaNacimiento) {
      return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    // Validar consentimiento
    if (!autorizacionDatos || !aceptaPoliticas) {
      return res.status(400).json({
        message:
          "Debes aceptar el tratamiento de datos personales y las políticas de privacidad.",
      });
    }

    // Validar duplicados
    const existeDNI = await Usuario.findOne({ where: { dni } });
    if (existeDNI) return res.status(400).json({ message: "El DNI ya está registrado." });

    const existeEmail = await Usuario.findOne({ where: { email } });
    if (existeEmail)
      return res.status(400).json({ message: "El correo ya está registrado." });

    // Calcular edad mínima
    const edad = calcularEdad(fechaNacimiento);
    if (edad < 18) {
      return res.status(400).json({
        message: "El registro solo está permitido para usuarios mayores de 18 años.",
      });
    }

    // Crear usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      apellido,
      dni,
      email,
      password,
      fechaNacimiento,
      celular,
      direccion,
      autorizacionDatos,
      aceptaPoliticas,
      rol: "cliente",
    });

    res.status(201).json({
      message: "Usuario registrado correctamente 🐾",
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        dni: nuevoUsuario.dni,
        email: nuevoUsuario.email,
        celular: nuevoUsuario.celular,
        direccion: nuevoUsuario.direccion,
        rol: nuevoUsuario.rol,
      },
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: "El DNI o correo electrónico ya están registrados.",
      });
    }
    return res.status(500).json({ message: "Error al registrar el usuario." });
  }
};

// ✅ LOGIN (2FA obligatorio)
export const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario)
      return res.status(404).json({ message: "Usuario no encontrado." });

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido)
      return res.status(401).json({ message: "Contraseña incorrecta." });

    // 🟢 Si ya tiene 2FA configurado
    if (usuario.secret2FA) {
      return res.status(200).json({
        message: "Se requiere verificación 2FA.",
        requiere2FA: true,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          dni: usuario.dni,
          celular: usuario.celular,
        },
      });
    }

    // 🔵 Si no tiene 2FA, se genera un nuevo QR y secreto
    const secret = speakeasy.generateSecret({
      name: `Colitas Sanas (${usuario.email})`,
    });

    usuario.secret2FA = secret.base32;
    await usuario.save();

    const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);

    return res.status(200).json({
      message:
        "Autenticación 2FA habilitada. Escanea el código QR con Google Authenticator antes de continuar.",
      requiere2FA: true,
      mostrarQR: true,
      qrCode: qrCodeDataURL,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        dni: usuario.dni,
        celular: usuario.celular,
      },
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ message: "Error al iniciar sesión." });
  }
};

// ✅ VERIFICAR CÓDIGO 2FA
export const verificar2FA = async (req, res) => {
  try {
    const { email, codigo } = req.body;

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario || !usuario.secret2FA) {
      return res.status(400).json({ message: "2FA no habilitado para este usuario." });
    }

    const verificado = speakeasy.totp.verify({
      secret: usuario.secret2FA,
      encoding: "base32",
      token: codigo,
      window: 1,
    });

    if (!verificado) {
      return res.status(401).json({ message: "Código 2FA inválido o expirado." });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        dni: usuario.dni,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({
      message: "Verificación 2FA exitosa.",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        dni: usuario.dni,
        rol: usuario.rol,
        celular: usuario.celular,
      },
    });
  } catch (error) {
    console.error("Error en verificar2FA:", error);
    res.status(500).json({ message: "Error al verificar el código 2FA." });
  }
};

// 📨 SOLICITAR RECUPERACIÓN DE CONTRASEÑA
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario)
      return res
        .status(404)
        .json({ message: "No se encontró una cuenta con ese correo." });

    const token = crypto.randomBytes(32).toString("hex");
    usuario.resetToken = token;
    usuario.resetTokenExpira = Date.now() + 15 * 60 * 1000;
    await usuario.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"Colitas Sanas 🐾" <${process.env.MAIL_USER}>`,
      to: usuario.email,
      subject: "Recuperación de contraseña",
      html: `
        <h2>Hola ${usuario.nombre}</h2>
        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
        <a href="${resetUrl}" target="_blank">${resetUrl}</a>
        <p>⚠️ Este enlace expirará en 15 minutos.</p>
      `,
    });

    res.json({ message: "Correo de recuperación enviado correctamente." });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    res
      .status(500)
      .json({ message: "Error al enviar el correo de recuperación." });
  }
};

// 🔐 RESTABLECER CONTRASEÑA
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const usuario = await Usuario.findOne({
      where: {
        resetToken: token,
        resetTokenExpira: { [Op.gt]: Date.now() },
      },
    });

    if (!usuario)
      return res.status(400).json({ message: "Token inválido o expirado." });

    // ❗ No lo hashees manualmente
    usuario.password = password;
    usuario.resetToken = null;
    usuario.resetTokenExpira = null;

    await usuario.save(); // Sequelize hará el hash automáticamente

    res.json({ message: "Contraseña restablecida correctamente." });
  } catch (error) {
    console.error("Error en resetPassword:", error);
    res.status(500).json({ message: "Error al restablecer la contraseña." });
  }
};


// 🔑 HABILITAR 2FA (solo si no está configurado aún)
export const habilitar2FA = async (req, res) => {
  try {
    const { email } = req.body;

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario)
      return res.status(404).json({ message: "Usuario no encontrado." });

    // Si ya tiene 2FA configurado, solo devolvemos el QR existente
    if (usuario.secret2FA) {
      const otpauthUrl = `otpauth://totp/Colitas%20Sanas%20(${usuario.email})?secret=${usuario.secret2FA}&issuer=ColitasSanas`;
      const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl);

      return res.status(200).json({
        message: "2FA ya está habilitado.",
        qrCode: qrCodeDataURL,
        secret: usuario.secret2FA,
      });
    }

    // Generar nuevo secreto
    const secret = speakeasy.generateSecret({
      name: `Colitas Sanas (${usuario.email})`,
    });

    usuario.secret2FA = secret.base32;
    await usuario.save();

    const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      message: "Autenticación 2FA habilitada correctamente.",
      qrCode: qrCodeDataURL,
      secret: secret.base32,
    });
  } catch (error) {
    console.error("Error al habilitar 2FA:", error);
    res
      .status(500)
      .json({ message: "Error al habilitar la autenticación 2FA." });
  }
};

// 📨 REINICIO DE 2FA (solicitar y confirmar)
export const solicitarReset2FA = async (req, res) => {
  try {
    const { email } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario)
      return res
        .status(404)
        .json({ message: "No se encontró una cuenta con ese correo." });

    const token = crypto.randomBytes(32).toString("hex");
    usuario.resetToken = token;
    usuario.resetTokenExpira = Date.now() + 15 * 60 * 1000;
    await usuario.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    });

    const resetUrl = `http://localhost:5173/reset-2fa?token=${token}`;

    await transporter.sendMail({
      from: `"Colitas Sanas 🐾" <${process.env.MAIL_USER}>`,
      to: usuario.email,
      subject: "Restablecer autenticación 2FA",
      html: `
        <h2>Hola ${usuario.nombre}</h2>
        <p>Hemos recibido una solicitud para restablecer tu autenticación 2FA.</p>
        <a href="${resetUrl}" target="_blank">${resetUrl}</a>
        <p>⚠️ Este enlace expirará en 15 minutos.</p>
      `,
    });

    res.json({ message: "Correo de restablecimiento enviado correctamente." });
  } catch (error) {
    console.error("Error al solicitar reset 2FA:", error);
    res
      .status(500)
      .json({ message: "Error al enviar el correo de restablecimiento." });
  }
};

export const confirmarReset2FA = async (req, res) => {
  try {
    const { token } = req.body;

    const usuario = await Usuario.findOne({
      where: {
        resetToken: token,
        resetTokenExpira: { [Op.gt]: Date.now() },
      },
    });

    if (!usuario)
      return res.status(400).json({ message: "Token inválido o expirado." });

    usuario.secret2FA = null;
    usuario.resetToken = null;
    usuario.resetTokenExpira = null;
    await usuario.save();

    res.json({
      message:
        "Tu autenticación 2FA ha sido restablecida. Se generará un nuevo código QR en tu próximo inicio de sesión.",
    });
  } catch (error) {
    console.error("Error al confirmar reset 2FA:", error);
    res
      .status(500)
      .json({ message: "Error al restablecer autenticación 2FA." });
  }
};

// 🔍 Buscar usuarios por DNI
export const buscarUsuarios = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res
        .status(400)
        .json({ message: "Debe proporcionar un DNI para buscar." });
    }

    const usuarios = await Usuario.findAll({
      where: {
        dni: {
          [Op.iLike]: `%${query}%`,
        },
      },
      attributes: ["id", "nombre", "apellido", "email", "dni", "celular"],
    });

    if (usuarios.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron usuarios con ese DNI." });
    }

    res.json(usuarios);
  } catch (error) {
    console.error("Error al buscar usuarios por DNI:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

/* ✅✅ CREAR CLIENTE RÁPIDO DESDE RECEPCIÓN
   - Solo recepcionista / admin / médico
   - Genera contraseña temporal
   - Marca autorizaciones como aceptadas
*/
export const crearClienteRapido = async (req, res) => {
  try {
    const usuarioLogueado = req.usuario;

    // 🛡 Validar rol que crea clientes
    if (
      !usuarioLogueado ||
      !["recepcionista", "admin", "medico"].includes(usuarioLogueado.rol)
    ) {
      return res
        .status(403)
        .json({ message: "No tienes permisos para crear clientes." });
    }

    const {
      nombre,
      apellido,
      dni,
      email,
      fechaNacimiento,
      celular,
      direccion,
    } = req.body;

    // 🧩 Campos obligatorios
    if (!nombre || !apellido || !dni || !email || !fechaNacimiento) {
      return res.status(400).json({
        message:
          "Nombre, apellido, DNI, correo y fecha de nacimiento son obligatorios.",
      });
    }

    // 🧮 Edad mínima 18
    const edad = calcularEdad(fechaNacimiento);
    if (edad < 18) {
      return res.status(400).json({
        message:
          "Solo se pueden registrar clientes mayores de 18 años desde recepción.",
      });
    }

    // 🔎 Validar duplicados
    const existeDni = await Usuario.findOne({ where: { dni } });
    if (existeDni) {
      return res
        .status(400)
        .json({ message: "El DNI ya está registrado en el sistema." });
    }

    const existeEmail = await Usuario.findOne({ where: { email } });
    if (existeEmail) {
      return res
        .status(400)
        .json({ message: "El correo ya está registrado en el sistema." });
    }

    // 📱 Validar celular solo si viene informado
    let celularLimpio = null;
    if (celular && celular.toString().trim() !== "") {
      const soloDigitos = celular.toString().trim();
      // debe coincidir con la validación del modelo: entre 9 y 15 dígitos
      if (!/^\d{9,15}$/.test(soloDigitos)) {
        return res.status(400).json({
          message:
            "El número de celular debe tener entre 9 y 15 dígitos numéricos.",
        });
      }
      celularLimpio = soloDigitos;
    }

    // 🔐 Generar contraseña temporal (ej: CS-72733060)
    const tempPassword = `CS-${dni}`;

    const nuevoUsuario = await Usuario.create({
      nombre,
      apellido,
      dni,
      email,
      password: tempPassword, // se hashea en el hook beforeCreate
      fechaNacimiento,
      celular: celularLimpio,
      direccion: direccion && direccion.trim() !== "" ? direccion.trim() : null,
      autorizacionDatos: true,
      aceptaPoliticas: true,
      rol: "cliente",
    });

    // 📨 Intentar enviar correo con la contraseña temporal (opcional)
    let emailEnviado = false;
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Colitas Sanas 🐾" <${process.env.MAIL_USER}>`,
        to: email,
        subject: "Tu cuenta en Colitas Sanas",
        html: `
          <h2>Hola ${nombre}</h2>
          <p>Se ha creado tu cuenta en <strong>Colitas Sanas</strong>.</p>
          <p>Estos son tus datos de acceso para la web:</p>
          <ul>
            <li><strong>Correo:</strong> ${email}</li>
            <li><strong>Contraseña temporal:</strong> ${tempPassword}</li>
          </ul>
          <p>Te recomendamos cambiar la contraseña después de tu primer inicio de sesión.</p>
        `,
      });

      emailEnviado = true;
    } catch (errMail) {
      console.error("❌ Error enviando correo a cliente rápido:", errMail);
    }

    return res.status(201).json({
      message: "Cliente creado correctamente.",
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        dni: nuevoUsuario.dni,
        email: nuevoUsuario.email,
        celular: nuevoUsuario.celular,
        direccion: nuevoUsuario.direccion,
      },
      tempPassword,
      emailEnviado,
    });
  } catch (error) {
    console.error("Error en crearClienteRapido:", error);
    return res.status(500).json({
      message: "Error al registrar el cliente desde recepción.",
    });
  }
};
