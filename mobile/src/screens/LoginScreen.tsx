import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuthStore } from '../stores/authStore';
import Input from '../components/Input';
import Button from '../components/Button';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuthStore();
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('Main');
    }
  }, [isAuthenticated, navigation]);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigation.replace('Main');
    } catch (error: any) {
      Alert.alert('Ошибка входа', error.response?.data?.error || 'Неверный email или пароль');
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
            <Ionicons name="log-in-outline" size={64} color="#3B82F6" />
          </View>
          <Text style={styles.title}>Вход в систему</Text>
          <Text style={styles.subtitle}>Введите свои учетные данные</Text>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Пароль"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />
            <Button
              title="Войти"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
            />
          </View>

          <View style={styles.registerLink}>
            <Text style={styles.registerText}>
              Нет аккаунта?{' '}
              <Text
                style={styles.registerLinkText}
                onPress={() => navigation.navigate('Register')}
              >
                Зарегистрироваться
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
  registerLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  registerLinkText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});

