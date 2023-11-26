# -*- coding: utf-8 -*-
"""
Conexion SNOWflake.ipynb
"""
import pandas as pd
import snowflake.connector
from snowflake.connector import DictCursor
from snowflake.connector.pandas_tools import write_pandas
from datetime import datetime

con = snowflake.connector.connect(
    user="mcarmen",
    password='Iotcem2023.',
    account='we12911.south-central-us.azure',
    warehouse='COMPUTE_WH',
    database='IOT',
    schema='PUBLIC'
)

cursor = con.cursor()
# Recuperamos los registros de la tabla de usuarios
cursor.execute("SELECT * FROM usuario")
usuarios = cursor.fetchall()
# Ahora podemos recorrer todos los usuarios
for usuario in usuarios:
    print(usuario[1])

con.close()
