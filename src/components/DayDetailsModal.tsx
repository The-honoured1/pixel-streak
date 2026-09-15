import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Habit } from '../types';
import { PALETTES } from '../constants/palettes';
import { formatDisplayDate } from '../utils/dateUtils';

interface DayDetailsModalProps {
  visible: boolean;
  habit: Habit | null;
  date: string;
  level: number;
  onClose: () => void;
  onSelectLevel: (level: number) => void;
}

export const DayDetailsModal: React.FC<DayDetailsModalProps> = ({
  visible,
  habit,
  date,
  level,
  onClose,
  onSelectLevel,
}) => {
  if (!habit || !visible) return null;

  const palette = PALETTES[habit.palette] || PALETTES.emerald;
  const levelLabels = ['Missed / Rest', 'Light Effort', 'Moderate', 'Strong', 'Mastered (100%)'];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.habitHeader}>
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: `${palette.accent}20`, borderColor: `${palette.accent}40` },
                ]}
              >
                <MaterialCommunityIcons
                  name={(habit.icon as any) || 'check-circle-outline'}
                  size={18}
                  color={palette.accent}
                />
              </View>
              <Text style={styles.habitName} numberOfLines={1}>
                {habit.name}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Date info */}
          <Text style={styles.dateLabel}>{formatDisplayDate(date)}</Text>
          <Text style={styles.instruction}>
            Choose intensity for this day:
          </Text>

          {/* Intensity selector blocks */}
          <View style={styles.intensityRow}>
            {[0, 1, 2, 3, 4].map(lvl => {
              const isSelected = level === lvl;
              const bgColor = palette.levels[lvl];

              return (
                <TouchableOpacity
                  key={lvl}
                  style={[
                    styles.intensityBox,
                    { backgroundColor: bgColor },
                    isSelected && [styles.intensityBoxSelected, { borderColor: palette.accent }],
                  ]}
                  onPress={() => {
                    onSelectLevel(lvl);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.intensityNum,
                      { color: lvl === 0 ? '#64748B' : '#FFFFFF' },
                    ]}
                  >
                    {lvl === 0 ? '0' : lvl}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Selected Level:</Text>
            <Text style={[styles.statusValue, { color: palette.accent }]}>
              {levelLabels[level] || 'Rest'}
            </Text>
          </View>

          {/* Quick Action Button */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                level > 0 ? styles.toggleBtnActive : [styles.toggleBtnEmpty, { backgroundColor: palette.accent }],
              ]}
              onPress={() => {
                onSelectLevel(level > 0 ? 0 : 4);
                onClose();
              }}
            >
              <MaterialCommunityIcons
                name={level > 0 ? 'close-circle-outline' : 'check-circle-outline'}
                size={18}
                color={level > 0 ? '#F43F5E' : '#0B0F19'}
              />
              <Text
                style={[
                  styles.toggleBtnText,
                  { color: level > 0 ? '#F43F5E' : '#0B0F19' },
                ]}
              >
                {level > 0 ? 'Clear This Day' : 'Mark Completed (Level 4)'}
              </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#121622',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    maxWidth: 380,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitName: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  dateLabel: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 6,
  },
  instruction: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  intensityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: 10,
  },
  intensityBox: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  intensityBoxSelected: {
    borderWidth: 2.5,
    transform: [{ scale: 1.06 }],
  },
  intensityNum: {
    fontSize: 15,
    fontWeight: '800',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statusLabel: {
    color: '#64748B',
    fontSize: 13,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  actions: {
    marginTop: 16,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
  },
  toggleBtnEmpty: {},
  toggleBtnActive: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderWidth: 1.5,
    borderColor: '#F43F5E',
  },
  toggleBtnText: {
    fontWeight: '800',
    fontSize: 14,
  },
});
