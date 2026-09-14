import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useHabits } from '../context/HabitContext';

interface ExportImportModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({ visible, onClose }) => {
  const { exportData, importData, resetData } = useHabits();
  const [tab, setTab] = useState<'export' | 'import'>('export');
  const [exportJson, setExportJson] = useState('');
  const [importJsonText, setImportJsonText] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handleOpenExport = async () => {
    const data = await exportData();
    setExportJson(data);
    setTab('export');
  };

  React.useEffect(() => {
    if (visible) {
      handleOpenExport();
      setImportJsonText('');
      setCopiedNotification(false);
    }
  }, [visible]);

  const handleImport = async () => {
    if (!importJsonText.trim()) {
      Alert.alert('Empty Data', 'Please paste valid JSON data to import.');
      return;
    }

    Alert.alert(
      'Confirm Import',
      'This will replace or update your current habit data. Proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          onPress: async () => {
            const res = await importData(importJsonText.trim());
            if (res.success) {
              Alert.alert('Success', 'Habit data imported successfully!');
              onClose();
            } else {
              Alert.alert('Import Failed', res.error || 'Invalid JSON format');
            }
          },
        },
      ]
    );
  };

  const handleResetDemoData = () => {
    Alert.alert(
      'Reset Demo Data',
      'This will replace your current habits with fresh demo data containing realistic streak matrices. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset to Demo',
          style: 'destructive',
          onPress: async () => {
            await resetData();
            Alert.alert('Data Reset', 'Demo data loaded successfully!');
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <MaterialCommunityIcons name="database-cog-outline" size={22} color="#38bdf8" />
              <Text style={styles.title}>Data Management</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color="#8b949e" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabItem, tab === 'export' && styles.tabItemActive]}
              onPress={() => setTab('export')}
            >
              <Text style={[styles.tabText, tab === 'export' && styles.tabTextActive]}>
                Export Backup
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabItem, tab === 'import' && styles.tabItemActive]}
              onPress={() => setTab('import')}
            >
              <Text style={[styles.tabText, tab === 'import' && styles.tabTextActive]}>
                Import Data
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {tab === 'export' ? (
              <View>
                <Text style={styles.description}>
                  All your habit matrix data is stored locally on this device. You can copy the raw JSON backup below to restore anytime.
                </Text>

                <View style={styles.boxHeader}>
                  <Text style={styles.boxLabel}>Export JSON</Text>
                  {copiedNotification && (
                    <Text style={styles.copiedText}>Copied to clipboard!</Text>
                  )}
                </View>

                <TextInput
                  style={styles.jsonBox}
                  value={exportJson}
                  editable={false}
                  multiline
                  numberOfLines={10}
                  selectTextOnFocus
                />
              </View>
            ) : (
              <View>
                <Text style={styles.description}>
                  Paste your previously exported Pixel Streak JSON backup below to restore your habits and check-in history.
                </Text>

                <Text style={styles.boxLabel}>Paste JSON here</Text>
                <TextInput
                  style={[styles.jsonBox, styles.jsonBoxEditable]}
                  placeholder='{"version": "1.0", "habits": [...]}'
                  placeholderTextColor="#6e7681"
                  value={importJsonText}
                  onChangeText={setImportJsonText}
                  multiline
                  numberOfLines={10}
                  textAlignVertical="top"
                />

                <TouchableOpacity style={styles.importBtn} onPress={handleImport}>
                  <MaterialCommunityIcons name="upload" size={18} color="#ffffff" />
                  <Text style={styles.importBtnText}>Restore from JSON</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Reset to demo data button */}
            <View style={styles.dangerZone}>
              <Text style={styles.dangerTitle}>Quick Actions</Text>
              <TouchableOpacity
                style={styles.demoResetBtn}
                onPress={handleResetDemoData}
              >
                <MaterialCommunityIcons name="refresh" size={18} color="#ff7b00" />
                <Text style={styles.demoResetText}>Reload Rich Demo Habits & Streaks</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#161b22',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: '#30363d',
    maxHeight: '85%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#f0f6fc',
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#38bdf8',
  },
  tabText: {
    color: '#8b949e',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#38bdf8',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  description: {
    color: '#8b949e',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  boxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  boxLabel: {
    color: '#c9d1d9',
    fontSize: 12,
    fontWeight: '600',
  },
  copiedText: {
    color: '#39d353',
    fontSize: 12,
    fontWeight: '600',
  },
  jsonBox: {
    backgroundColor: '#0d1117',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#30363d',
    color: '#8b949e',
    padding: 12,
    fontSize: 11,
    fontFamily: 'monospace',
    maxHeight: 180,
  },
  jsonBoxEditable: {
    color: '#f0f6fc',
    marginTop: 6,
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f6feb',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  importBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  dangerZone: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#21262d',
    marginBottom: 20,
  },
  dangerTitle: {
    color: '#8b949e',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  demoResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 123, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 123, 0, 0.3)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  demoResetText: {
    color: '#ff7b00',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  doneBtn: {
    backgroundColor: '#21262d',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#f0f6fc',
    fontWeight: '700',
    fontSize: 14,
  },
});
