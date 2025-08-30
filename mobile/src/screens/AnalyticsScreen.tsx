import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function AnalyticsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>
            Your mood insights and patterns
          </Text>
        </View>

        {/* Coming Soon Card */}
        <View style={styles.comingSoonCard}>
          <Icon name="chart-timeline-variant" size={60} color="#8B5CF6" />
          <Text style={styles.comingSoonTitle}>Advanced Analytics Coming Soon</Text>
          <Text style={styles.comingSoonText}>
            We're working on bringing you detailed mood analytics, 
            AI-powered insights, and pattern recognition right to your mobile device.
          </Text>
          
          {/* Features List */}
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Icon name="brain" size={20} color="#8B5CF6" />
              <Text style={styles.featureText}>AI-powered mood insights</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="chart-line" size={20} color="#8B5CF6" />
              <Text style={styles.featureText}>Trend analysis & predictions</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="calendar-heart" size={20} color="#8B5CF6" />
              <Text style={styles.featureText}>Weekly & monthly summaries</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="target" size={20} color="#8B5CF6" />
              <Text style={styles.featureText}>Mood improvement suggestions</Text>
            </View>
          </View>
          
          <Text style={styles.availableNow}>
            📱 Available now on the web version at project-iota-gray.vercel.app
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  comingSoonCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  comingSoonTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  featuresList: {
    alignSelf: 'stretch',
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 15,
    flex: 1,
  },
  availableNow: {
    fontSize: 14,
    color: '#8B5CF6',
    textAlign: 'center',
    backgroundColor: '#F3F4F6',
    padding: 15,
    borderRadius: 12,
    alignSelf: 'stretch',
  },
});
