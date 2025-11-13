import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { apiClient } from '../lib/api';
import Input from '../components/Input';
import Button from '../components/Button';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    key: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.key) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.register(formData);
      Alert.alert('Успех', 'Регистрация прошла успешно. Войдите в систему.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error: any) {
      Alert.alert('Ошибка регистрации', error.response?.data?.error || 'Не удалось зарегистрироваться');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="person-add-outline" size={64} color="#3B82F6" />
          </View>
          <Text style={styles.title}>Регистрация</Text>
          <Text style={styles.subtitle}>Создайте новый аккаунт</Text>

          <View style={styles.form}>
            <Input
              label="Имя"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Ваше имя"
            />
            <Input
              label="Email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Пароль"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              placeholder="••••••••"
              secureTextEntry
            />
            <Input
              label="Ключ регистрации"
              value={formData.key}
              onChangeText={(text) => setFormData({ ...formData, key: text })}
              placeholder="Введите ключ регистрации"
            />
            <Button
              title="Зарегистрироваться"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
            />
          </View>

          <View style={styles.loginLink}>
            <Text style={styles.loginText}>
              Уже есть аккаунт?{' '}
              <Text
                style={styles.loginLinkText}
                onPress={() => navigation.navigate('Login')}
              >
                Войти
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLinkText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});

