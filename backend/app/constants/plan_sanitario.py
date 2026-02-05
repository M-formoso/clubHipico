"""
Plan Sanitario Haras Club 2026
Resolución 1942/2026

Define los calendarios sanitarios para caballos según su categoría.
"""

PLAN_SANITARIO_2026 = {
    "A": {
        "nombre": "Categoría A",
        "descripcion": "Plan sanitario completo según Resolución 1942 Haras Club 2026",
        "costo_mensual": 45000,
        "dosis_anuales": {
            "desparasitacion": 3,
            "aie": 5,
            "influenza": 3,
            "quintuple": 1,
            "adenitis": 1,
            "rabia": 1
        },
        "calendario": [
            {
                "mes": 1,
                "mes_nombre": "Enero",
                "actividades": [
                    {
                        "tipo": "vacuna",
                        "nombre": "Vacuna Antirrábica",
                        "descripcion": "Vacunación contra la rabia",
                    }
                ]
            },
            {
                "mes": 2,
                "mes_nombre": "Febrero",
                "actividades": [
                    {
                        "tipo": "analisis",
                        "nombre": "AIE",
                        "descripcion": "Análisis de Anemia Infecciosa Equina",
                    },
                    {
                        "tipo": "desparasitacion",
                        "nombre": "Desparasitación",
                        "descripcion": "Aplicación de antiparasitario",
                    }
                ]
            },
            {
                "mes": 3,
                "mes_nombre": "Marzo",
                "actividades": [
                    {
                        "tipo": "vacuna",
                        "nombre": "Vacuna c/ Influenza",
                        "descripcion": "Vacunación contra Influenza Equina",
                    }
                ]
            },
            {
                "mes": 4,
                "mes_nombre": "Abril",
                "actividades": [
                    {
                        "tipo": "analisis",
                        "nombre": "AIE",
                        "descripcion": "Análisis de Anemia Infecciosa Equina",
                    },
                    {
                        "tipo": "vacuna",
                        "nombre": "Vacuna c/ Adenitis",
                        "descripcion": "Vacunación contra Adenitis Equina",
                    }
                ]
            },
            {
                "mes": 6,
                "mes_nombre": "Junio",
                "actividades": [
                    {
                        "tipo": "analisis",
                        "nombre": "AIE",
                        "descripcion": "Análisis de Anemia Infecciosa Equina",
                    },
                    {
                        "tipo": "desparasitacion",
                        "nombre": "Desparasitación",
                        "descripcion": "Aplicación de antiparasitario",
                    },
                    {
                        "tipo": "vacuna",
                        "nombre": "Vacuna c/ Influenza",
                        "descripcion": "Vacunación contra Influenza Equina",
                    }
                ]
            },
            {
                "mes": 8,
                "mes_nombre": "Agosto",
                "actividades": [
                    {
                        "tipo": "analisis",
                        "nombre": "AIE",
                        "descripcion": "Análisis de Anemia Infecciosa Equina",
                    }
                ]
            },
            {
                "mes": 10,
                "mes_nombre": "Octubre",
                "actividades": [
                    {
                        "tipo": "analisis",
                        "nombre": "AIE",
                        "descripcion": "Análisis de Anemia Infecciosa Equina",
                    },
                    {
                        "tipo": "vacuna",
                        "nombre": "Vacuna Quíntuple",
                        "descripcion": "Vacunación Quíntuple (Influenza, Tétanos, Encefalomielitis, Rinoneumonitis)",
                    }
                ]
            },
            {
                "mes": 12,
                "mes_nombre": "Diciembre",
                "actividades": [
                    {
                        "tipo": "desparasitacion",
                        "nombre": "Desparasitación",
                        "descripcion": "Aplicación de antiparasitario",
                    }
                ]
            }
        ]
    },
    "B": {
        "nombre": "Categoría B",
        "descripcion": "Plan sanitario alternativo según Resolución 1942 Haras Club 2026",
        "costo_mensual": 35000,
        "dosis_anuales": {
            "desparasitacion": 3,
            "aie": 2,
            "influenza": 2,
            "quintuple": 1,
            "adenitis": 1,
            "rabia": 1
        },
        "calendario": [
            {
                "mes": 1,
                "mes_nombre": "Enero",
                "actividades": [
                    {
                        "tipo": "vacuna",
                        "nombre": "Vacuna c/ Rabia",
                        "descripcion": "Vacunación contra la rabia",
                    }
                ]
            },
            {
                "mes": 2,
                "mes_nombre": "Febrero",
                "actividades": [
                    {
                        "tipo": "analisis",
                        "nombre": "AIE",
                        "descripcion": "Análisis de Anemia Infecciosa Equina",
                    },
                    {
                        "tipo": "desparasitacion",
                        "nombre": "Desparasitación",
                        "descripcion": "Aplicación de antiparasitario",
                    }
                ]
            },
            {
                "mes": 3,
                "mes_nombre": "Marzo",
                "actividades": [
                    {
                        "tipo": "vacuna",
                        "nombre": "Vacuna c/ Influenza",
                        "descripcion": "Vacunación contra Influenza Equina",
                    }
                ]
            },
            {
                "mes": 4,
                "mes_nombre": "Abril",
                "actividades": [
                    {
                        "tipo": "vacuna",
                        "nombre": "Vacuna c/ Adenitis",
                        "descripcion": "Vacunación contra Adenitis Equina",
                    }
                ]
            },
            {
                "mes": 6,
                "mes_nombre": "Junio",
                "actividades": [
                    {
                        "tipo": "desparasitacion",
                        "nombre": "Desparasitación",
                        "descripcion": "Aplicación de antiparasitario",
                    }
                ]
            },
            {
                "mes": 7,
                "mes_nombre": "Julio",
                "actividades": [
                    {
                        "tipo": "vacuna",
                        "nombre": "Vacuna c/ Influenza",
                        "descripcion": "Vacunación contra Influenza Equina",
                    }
                ]
            },
            {
                "mes": 10,
                "mes_nombre": "Octubre",
                "actividades": [
                    {
                        "tipo": "analisis",
                        "nombre": "AIE",
                        "descripcion": "Análisis de Anemia Infecciosa Equina",
                    },
                    {
                        "tipo": "vacuna",
                        "nombre": "Quíntuple",
                        "descripcion": "Vacunación Quíntuple (Influenza, Tétanos, Encefalomielitis, Rinoneumonitis)",
                    }
                ]
            },
            {
                "mes": 12,
                "mes_nombre": "Diciembre",
                "actividades": [
                    {
                        "tipo": "desparasitacion",
                        "nombre": "Desparasitación",
                        "descripcion": "Aplicación de antiparasitario",
                    }
                ]
            }
        ]
    }
}


# Mapeo de tipos de actividad a tipos de registro en el sistema
TIPO_ACTIVIDAD_A_MODELO = {
    "vacuna": "vacuna",
    "desparasitacion": "antiparasitario",
    "analisis": "vacuna",  # AIE se registra como vacuna en el sistema actual
}
