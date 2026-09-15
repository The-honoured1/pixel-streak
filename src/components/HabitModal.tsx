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
import { PALETTES, AVAILABLE_ICONS } from '../constants/palettes';

interface HabitModalProps {
  visible: boolean;
  habitToEdit?: Habit | null;
  onClose: () => void;
  onSave: (data: Omit<Habit, 'id' | 'createdAt' | 'records' | 'order' | 'archived'>) => void;
  onUpdate?: (id: string, updates: Partial<Habit>) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
}

const FREQUENCY_OPTIONS: { key: FrequencyType; label: string; icon: string }[] = [
  { key: 'daily',    label: 'Every Day', icon: 'calendar-range' },
  { key: 'weekdays', label: 'Weekdays',  icon: 'briefcase-outline' },
  { key: 'weekends', label: 'Weekends',  icon: 'beach' },
];

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
  const [icon, setIcon] = useState('fire');
  const [palette, setPalette] = useState<PaletteKey>('emerald');
  const [frequency, setFrequency] = useState<FrequencyType>('daily');

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name);
      setDescription(habitToEdit.description || '');
      setIcon(habitToEdit.icon);
      setPalette(habitToEdit.palette);
      setFrequency(habitToEdit.frequency || 'daily');
    } else {
      setName('');
      setDescription('');
      setIcon('fire');
      setPalette('emerald');
      setFrequency('daily');
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
      });
    } else {
      onSave({
        name: name.trim(),
        description: description.trim(),
        icon,
        palette,
        frequency,
        category: 'General',
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (!habitToEdit || !onDelete) return;
    Alert.alert(
      'Delete Habit',
      `Permanently delete "${habitToEdit.name}" and all its history?`,
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

  const handleArchive = () => {
    if (!habitToEdit || !onArchive) return;
    Alert.alert(
      'Archive Habit',
      `Archive "${habitToEdit.name}"? Your history is kept — you can restore it from Settings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          onPress: () => {
            onArchive(habitToEdit.id);
            onClose();
          },
        },
      ]
    );
  };

  const activePal = PALETTES[palette] || PALETTES.emerald;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {habitToEdit ? 'Edit Habit' : 'New Habit'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Live Preview Card */}
            <View style={[styles.previewContainer, { borderColor: `${activePal.accent}30` }]}>
              <View
                style={[
                  styles.previewIcon,
                  { backgroundColor: `${activePal.accent}20`, borderColor: `${activePal.accent}40` },
                ]}
              >
                <MaterialCommunityIcons name={icon as any} size={28} color={activePal.accent} />
              </View>
              <View style={styles.previewInfo}>
                <Text style={styles.previewName} numberOfLines={1}>
                  {name.trim() || 'Habit Name'}
                </Text>
                <Text style={[styles.previewFreq, { color: `${activePal.accent}BB` }]}>
                  {FREQUENCY_OPTIONS.find(f => f.key === frequency)?.label ?? 'Every Day'}
                </Text>
              </View>
            </View>

            {/* Name Input */}
            <Text style={styles.sectionLabel}>Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Read 20 mins, Workout, Drink Water..."
              placeholderTextColor="#475569"
              value={name}
              onChangeText={setName}
              autoFocus={!habitToEdit && visible}
              maxLength={40}
            />

            {/* Description Input */}
            <Text style={styles.sectionLabel}>Note (optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textInputMultiline]}
              placeholder="Add a short note or motivation..."
              placeholderTextColor="#475569"
              value={description}
              onChangeText={setDescription}
              maxLength={120}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />

            {/* Frequency Selector */}
            <Text style={styles.sectionLabel}>Schedule</Text>
            <View style={styles.frequencyRow}>
              {FREQUENCY_OPTIONS.map(opt => {
                const isSelected = frequency === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.freqBtn,
                      isSelected && {
                        backgroundColor: `${activePal.accent}18`,
                        borderColor: activePal.accent,
                      },
                    ]}
                    onPress={() => setFrequency(opt.key)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={opt.icon as any}
                      size={16}
                      color={isSelected ? activePal.accent : '#64748B'}
                    />
                    <Text style={[styles.freqBtnText, isSelected && { color: activePal.accent, fontWeight: '700' }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Color Swatches */}
            <Text style={styles.sectionLabel}>Color Theme</Text>
            <View style={styles.colorRow}>
              {(Object.keys(PALETTES) as PaletteKey[]).map(key => {
                const pal = PALETTES[key];
                const isSelected = palette === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: pal.accent },
                      isSelected && styles.colorCircleSelected,
                    ]}
                    onPress={() => setPalette(key)}
                    activeOpacity={0.7}
                  >
                    {isSelected && (
                      <MaterialCommunityIcons name="check" size={16} color="#0B0F19" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Icon Picker */}
            <Text style={styles.sectionLabel}>Icon</Text>
            <View style={styles.iconsGrid}>
              {AVAILABLE_ICONS.map(ic => {
                const isSelected = icon === ic.name;
                return (
                  <TouchableOpacity
                    key={ic.name}
                    style={[
                      styles.iconButton,
                      isSelected && {
                        borderColor: activePal.accent,
                        backgroundColor: `${activePal.accent}20`,
                      },
                    ]}
                    onPress={() => setIcon(ic.name)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={ic.name as any}
                      size={24}
                      color={isSelected ? activePal.accent : '#64748B'}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Archive / Delete — only when editing */}
            {habitToEdit && (
              <View style={styles.dangerRow}>
                {onArchive && (
                  <TouchableOpacity style={styles.archiveButton} onPress={handleArchive}>
                    <MaterialCommunityIcons name="archive-arrow-down-outline" size={17} color="#F97316" />
                    <Text style={styles.archiveText}>Archive</Text>
                  </TouchableOpacity>
                )}
                {onDelete && (
                  <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <MaterialCommunityIcons name="trash-can-outline" size={17} color="#F43F5E" />
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>

          {/* Action Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: activePal.accent }]}
              onPress={handleSave}
              activeOpacity={0.8}
            >
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
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111522',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    maxHeight: '90%',
    paddingBottom: 24,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 99,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181E2C',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    gap: 14,
    marginBottom: 4,
  },
  previewIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  previewFreq: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  sectionLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginTop: 18,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#181E2C',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  textInputMultiline: {
    minHeight: 64,
    paddingTop: 13,
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  freqBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#181E2C',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  freqBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  colorCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.12 }],
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#181E2C',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 26,
  },
  archiveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: 'rgba(249, 115, 22, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.25)',
  },
  archiveText: {
    color: '#F97316',
    fontSize: 13,
    fontWeight: '700',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: 'rgba(244, 63, 94, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.25)',
  },
  deleteText: {
    color: '#F43F5E',
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  saveBtn: {
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#0B0F19',
    fontWeight: '800',
    fontSize: 16,
  },
});
