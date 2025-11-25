from rest_framework import serializers
from .models import Madre, Parto, RecienNacido

class RecienNacidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecienNacido
        fields = '__all__'

class PartoSerializer(serializers.ModelSerializer):
    # Anidamos los recién nacidos para que al consultar un parto,
    # veamos automáticamente qué bebés nacieron en él.
    recien_nacidos = RecienNacidoSerializer(many=True, read_only=True)

    class Meta:
        model = Parto
        fields = '__all__'

class MadreSerializer(serializers.ModelSerializer):
    # Anidamos los partos para ver el historial clínico de la madre
    partos = PartoSerializer(many=True, read_only=True)

    class Meta:
        model = Madre
        fields = '__all__'