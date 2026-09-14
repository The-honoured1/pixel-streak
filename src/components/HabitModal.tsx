import React, { useState, useEffect } from 'react';
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
import { Habit, PaletteKey, FrequencyType } from '../types';
import { PALETTES, AVAILABLE_ICONS, CATEGORIES } from '../constants/palettes';

interface HabitModalProps {
  visible: boolean;
  habitToEdit?: Habit | null;
  onClose: () => void;
  onSave: (data: Omit<Habit, 'id' | 'createdAt' | 'records' | 'order' | 'archived'>) => void;
  onUpdate?: (id: string, updates: Partial<Habit>) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
}

export const HabitModal: React.FC<HabitModalProps> = ({
  visible,
  habitToEdit,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  onArchive,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('check-circle-outline');
  const [palette, setPalette] = useState<PaletteKey>('emerald');
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [category, setCategory] = useState('Productivity');

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name);
      setDescription(habitToEdit.description || '');
      setIcon(habitToEdit.icon);
      setPalette(habitToEdit.palette);
      setFrequency(habitToEdit.frequency);
      setCategory(habitToEdit.category || 'Productivity');
    } else {
      setName('');
      setDescription('');
      setIcon('code-tags');
      setPalette('emerald');
      setFrequency('daily');
      setCategory('Productivity');
    }
  }, [habitToEdit, visible]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Habit Name Required', 'Please enter a name for your habit.');
      return;
    }

    if (habitToEdit && onUpdate) {
      onUpdate(habitToEdit.id, {
        name: name.trim(),
        description: description.trim(),
        icon,
        palette,
        frequency,
        category,
      });
    } else {
      onSave({
        name: name.trim(),
        description: description.trim(),
        icon,
        palette,
        frequency,
        category,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (!habitToEdit || !onDelete) return;
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habitToEdit.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(habitToEdit.id);
            onClose();
          },
        },
      ]
    );
  };

  const handleArchiveToggle = () => {
    if (!habitToEdit || !onArchive) return;
    onArchive(habitToEdit.id);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {habitToEdit ? 'Edit Habit' : 'New Pixel Habit'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color="#8b949e" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Habit Name Input */}
            <Text style={styles.sectionLabel}>Habit Title</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Read 20 pages, 5km Run, LeetCode..."
              placeholderTextColor="#6e7681"
              value={name}
              onChangeText={setName}
            />

            {/* Description Input */}
            <Text style={styles.sectionLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Details or motivation..."
              placeholderTextColor="#6e7681"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={2}
            />

            {/* Category */}
            <Text style={styles.sectionLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalChips}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    category === cat && styles.chipActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Frequency */}
            <Text style={styles.sectionLabel}>Frequency</Text>
            <View style={styles.frequencyRow}>
              {(['daily', 'weekdays', 'weekends'] as FrequencyType[]).map(freq => (
                <TouchableOpacity
                  key={freq}
                  style={[
                    styles.freqButton,
                    frequency === freq && styles.freqButtonActive,
                  ]}
                  onPress={() => setFrequency(freq)}
                >
                  <Text style={[styles.freqButtonText, frequency === freq && styles.freqButtonTextActive]}>
                    {freq.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Color Palette Picker */}
            <Text style={styles.sectionLabel}>Pixel Palette</Text>
            <View style={styles.palettesGrid}>
              {(Object.keys(PALETTES) as PaletteKey[]).map(key => {
                const pal = PALETTES[key];
                const isSelected = palette === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.paletteCard,
                      isSelected && { borderColor: pal.accent, backgroundColor: '#21262d' },
                    ]}
                    onPress={() => setPalette(key)}
                  >
                    <Text style={[styles.paletteName, isSelected && { color: pal.accent }]}>
                      {pal.name}
                    </Text>
                    <View style={styles.paletteStrip}>
                      {pal.levels.map((color, i) => (
                        <View
                          key={i}
                          style={[
                            styles.paletteDot,
                            { backgroundColor: color },
                          ]}
                        />
                      ))}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Icon Picker */}
            <Text style={styles.sectionLabel}>Habit Icon</Text>
            <View style={styles.iconsGrid}>
              {AVAILABLE_ICONS.map(item => {
                const isSelected = icon === item.name;
                return (
                  <TouchableOpacity
                    key={item.name}
                    style={[
                      styles.iconButton,
                      isSelected && styles.iconButtonSelected,
                    ]}
                    onPress={() => setIcon(item.name)}
                  >
                    <MaterialCommunityIcons
                      name={item.name as any}
                      size={24}
                      color={isSelected ? '#38bdf8' : '#8b949e'}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Action Buttons for Edit Mode */}
            {habitToEdit && (
              <View style={styles.destructiveActions}>
                <TouchableOpacity
                  style={styles.archiveButton}
                  onPress={handleArchiveToggle}
                >
                  <MaterialCommunityIcons
                    name={habitToEdit.archived ? 'package-up' : 'package-down'}
                    size={18}
                    color="#8b949e"
                  />
                  <Text style={styles.archiveText}>
                    {habitToEdit.archived ? 'Restore Habit' : 'Archive Habit'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDelete}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color="#f85149" />
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Footer Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>
                {habitToEdit ? 'Save Changes' : 'Create Habit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#161b22',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: '#30363d',
    maxHeight: '88%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
  },
  modalTitle: {
    color: '#f0f6fc',
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  sectionLabel: {
    color: '#c9d1d9',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 14,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#0d1117',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#30363d',
    color: '#f0f6fc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  horizontalChips: {
    flexDirection: 'row',
  },
  chip: {
    backgroundColor: '#21262d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#30363d',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: '#38bdf8',
  },
  chipText: {
    color: '#8b949e',
    fontSize: 12,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#38bdf8',
    fontWeight: '700',
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  freqButton: {
    flex: 1,
    backgroundColor: '#0d1117',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#30363d',
    alignItems: 'center',
  },
  freqButtonActive: {
    backgroundColor: '#238636',
    borderColor: '#2ea043',
  },
  freqButtonText: {
    color: '#8b949e',
    fontSize: 12,
    fontWeight: '700',
  },
  freqButtonTextActive: {
    color: '#ffffff',
  },
  palettesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paletteCard: {
    width: '48%',
    backgroundColor: '#0d1117',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#30363d',
    padding: 10,
  },
  paletteName: {
    color: '#8b949e',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  paletteStrip: {
    flexDirection: 'row',
    gap: 4,
  },
  paletteDot: {
    flex: 1,
    height: 12,
    borderRadius: 2,
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: '#30363d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonSelected: {
    borderColor: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  destructiveActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#30363d',
  },
  archiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  archiveText: {
    color: '#8b949e',
    fontSize: 13,
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  deleteText: {
    color: '#f85149',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#30363d',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#21262d',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#c9d1d9',
    fontWeight: '600',
    fontSize: 14,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#238636',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
