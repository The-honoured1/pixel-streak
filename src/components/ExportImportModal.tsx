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
  const { exportData, importData, resetData, clearAllData } = useHabits();
  const [tab, setTab] = useState<'export' | 'import'>('export');
  const [exportJson, setExportJson] = useState('');
  const [importJsonText, setImportJsonText] = useState('');

  const handleOpenExport = async () => {
    const data = await exportData();
    setExportJson(data);
    setTab('export');
  };

  React.useEffect(() => {
    if (visible) {
      handleOpenExport();
      setImportJsonText('');
    }
  }, [visible]);

  const handleImport = async () => {
    if (!importJsonText.trim()) {
      Alert.alert('Empty Data', 'Please paste valid JSON data to import.');
      return;
    }

    Alert.alert(
      'Confirm Import',
      'This will replace your current habit data with the imported data. Proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          onPress: async () => {
            const res = await importData(importJsonText.trim());
            if (res.success) {
              Alert.alert('Success', 'Habits imported successfully!');
              onClose();
            } else {
              Alert.alert('Import Failed', res.error || 'Invalid JSON format');
            }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Wipe All Data',
      'Are you sure you want to delete all habits and history for a completely clean fresh start?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Wipe Everything',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Cleared', 'All habits have been wiped clean.');
            onClose();
          },
        },
      ]
    );
  };

  const handleResetStarters = () => {
    Alert.alert(
      'Load Clean Starters',
      'This will set up clean starter habits with zero past records so you start on Day 1.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Load Starters',
          onPress: async () => {
            await resetData();
            Alert.alert('Done', 'Clean starter habits loaded.');
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
              <MaterialCommunityIcons name="cog-outline" size={22} color="#38BDF8" />
              <Text style={styles.title}>Settings & Data</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color="#94A3B8" />
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
                  All your habit data is stored locally on this device. You can copy the JSON backup below to save or transfer anytime.
                </Text>

                <Text style={styles.boxLabel}>Exported JSON Payload</Text>
                <TextInput
                  style={styles.jsonBox}
                  value={exportJson}
                  editable={false}
                  multiline
                  numberOfLines={8}
                  selectTextOnFocus
                />
              </View>
            ) : (
              <View>
                <Text style={styles.description}>
                  Paste your previously exported Pixel Streak JSON backup below to restore your habits.
                </Text>

                <Text style={styles.boxLabel}>Paste Backup JSON</Text>
                <TextInput
                  style={[styles.jsonBox, styles.jsonBoxEditable]}
                  placeholder='{"appName": "Pixel Streak", "habits": [...]}'
                  placeholderTextColor="#64748B"
                  value={importJsonText}
                  onChangeText={setImportJsonText}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                />

                <TouchableOpacity style={styles.importBtn} onPress={handleImport}>
                  <MaterialCommunityIcons name="cloud-upload-outline" size={18} color="#0B0F19" />
                  <Text style={styles.importBtnText}>Restore from JSON</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Quick Clean Actions */}
            <View style={styles.dangerZone}>
              <Text style={styles.dangerTitle}>Data Reset & Management</Text>

              <TouchableOpacity
                style={styles.cleanStartersBtn}
                onPress={handleResetStarters}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="creation-outline" size={18} color="#38BDF8" />
                <Text style={styles.cleanStartersText}>Load Clean Starter Habits (0 Records)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.wipeBtn}
                onPress={handleClearAll}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={18} color="#F43F5E" />
                <Text style={styles.wipeBtnText}>Wipe All Habits (Start Empty)</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>Close</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#121622',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    maxHeight: '85%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#38BDF8',
  },
  tabText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  description: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  boxLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  jsonBox: {
    backgroundColor: '#181E2C',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    color: '#94A3B8',
    padding: 12,
    fontSize: 12,
    fontFamily: 'monospace',
    maxHeight: 160,
  },
  jsonBoxEditable: {
    color: '#FFFFFF',
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#38BDF8',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  importBtnText: {
    color: '#0B0F19',
    fontWeight: '800',
    fontSize: 14,
  },
  dangerZone: {
    marginTop: 22,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 16,
    gap: 10,
  },
  dangerTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cleanStartersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  cleanStartersText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
  },
  wipeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.25)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  wipeBtnText: {
    color: '#F43F5E',
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  doneBtn: {
    backgroundColor: '#1E2536',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
