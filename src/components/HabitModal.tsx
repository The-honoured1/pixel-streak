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
import { Habit, PaletteKey } from '../types';
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
  const [icon, setIcon] = useState('fire');
  const [palette, setPalette] = useState<PaletteKey>('emerald');

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name);
      setIcon(habitToEdit.icon);
      setPalette(habitToEdit.palette);
    } else {
      setName('');
      setIcon('fire');
      setPalette('emerald');
    }
  }, [habitToEdit, visible]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Habit Name', 'Please enter a name for your habit.');
      return;
    }

    if (habitToEdit && onUpdate) {
      onUpdate(habitToEdit.id, {
        name: name.trim(),
        icon,
        palette,
      });
    } else {
      onSave({
        name: name.trim(),
        description: '',
        icon,
        palette,
        frequency: 'daily',
        category: 'General',
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (!habitToEdit || !onDelete) return;
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habitToEdit.name}"?`,
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
      `Archive "${habitToEdit.name}"? You can unarchive it later from Settings.`,
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
            <View style={styles.previewContainer}>
              <View
                style={[
                  styles.previewIcon,
                  { backgroundColor: `${activePal.accent}20`, borderColor: `${activePal.accent}40` },
                ]}
              >
                <MaterialCommunityIcons name={icon as any} size={28} color={activePal.accent} />
              </View>
              <Text style={styles.previewName} numberOfLines={1}>
                {name.trim() || 'Habit Name'}
              </Text>
            </View>

            {/* Name Input */}
            <Text style={styles.sectionLabel}>Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Read 20 mins, Workout, Water..."
              placeholderTextColor="#64748B"
              value={name}
              onChangeText={setName}
              autoFocus={!habitToEdit && visible}
              maxLength={40}
            />

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
                      color={isSelected ? activePal.accent : '#94A3B8'}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Archive button if editing */}
            {habitToEdit && onArchive && (
              <TouchableOpacity style={styles.archiveButton} onPress={handleArchive}>
                <MaterialCommunityIcons name="archive-arrow-down-outline" size={18} color="#F97316" />
                <Text style={styles.archiveText}>Archive this habit</Text>
              </TouchableOpacity>
            )}

            {/* Delete button if editing */}
            {habitToEdit && (
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <MaterialCommunityIcons name="trash-can-outline" size={18} color="#F43F5E" />
                <Text style={styles.deleteText}>Delete this habit</Text>
              </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111522',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    maxHeight: '85%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
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
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 14,
    marginBottom: 8,
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  sectionLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 16,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#181E2C',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 16,
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
    transform: [{ scale: 1.1 }],
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  archiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 12,
  },
  archiveText: {
    color: '#F97316',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 12,
  },
  deleteText: {
    color: '#F43F5E',
    fontSize: 14,
    fontWeight: '600',
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
