CREATE TABLE usuario
(id integer,
nombre varchar(40),
apellido varchar(40),
direccion varchar(40),
nacimiento date,
sexo char(1),
estatura float,
peso float,
correo varchar(40),
celular char(15),
CONSTRAINT usuario_pk PRIMARY KEY(id));
CREATE TABLE medidas
(idmedida integer,
Nombre varchar(40),
Unidad varchar(40),
CONSTRAINT datos_pk PRIMARY KEY(idmedida));
CREATE TABLE registros
(idregistro integer autoincrement start 1 increment 1,
fecha date default current_date,
hora integer,
usuario integer,
medida integer,
idsensor integer,
valor float,
CONSTRAINT reg_pk PRIMARY KEY(idregistro),
CONSTRAINT reg_fk_me FOREIGN KEY(medida) REFERENCES medidas(idmedida),
CONSTRAINT reg_fk_usu FOREIGN KEY(usuario) REFERENCES usuario(id) );