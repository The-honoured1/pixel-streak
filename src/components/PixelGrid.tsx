import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { generateContributionMatrix, MatrixColumn, getDaysCountForSpan, formatDisplayDate } from '../utils/dateUtils';
import { PALETTES } from '../constants/palettes';
import { PaletteKey, ViewSpan } from '../types';

interface PixelGridProps {
  records: Record<string, number>;
  paletteKey: PaletteKey;
  span?: ViewSpan;
  squareSize?: number;
  gap?: number;
  onDayPress?: (date: string, level: number) => void;
  showLegend?: boolean;
  showDayLabels?: boolean;
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const PixelGrid: React.FC<PixelGridProps> = ({
  records,
  paletteKey,
  span = '90days',
  squareSize = 13,
  gap = 3,
  onDayPress,
  showLegend = true,
  showDayLabels = true,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const palette = PALETTES[paletteKey] || PALETTES.emerald;
  const weeksCount = getDaysCountForSpan(span);

  const matrix: MatrixColumn[] = useMemo(() => {
    return generateContributionMatrix(weeksCount);
  }, [weeksCount]);

  // Scroll to the latest weeks (right side) on initial mount / span change
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 50);
    return () => clearTimeout(timer);
  }, [span, matrix]);

  const getColor = (level: number, isFuture: boolean) => {
    if (isFuture) return '#10141a'; // Dimmer empty for future
    const safeLevel = Math.min(Math.max(0, level || 0), 4);
    return palette.levels[safeLevel];
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Day of week labels */}
        {showDayLabels && (
          <View style={[styles.dayLabelsColumn, { marginRight: gap + 2 }]}>
            <View style={{ height: 16 }} />
            {DAY_LABELS.map((day, idx) => (
              <View
                key={idx}
                style={[
                  styles.dayLabelCell,
                  {
                    height: squareSize,
                    marginBottom: gap,
                  },
                ]}
              >
                {/* Show Monday, Wednesday, Friday labels */}
                {idx === 1 || idx === 3 || idx === 5 ? (
                  <Text style={styles.dayLabelText}>{day}</Text>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* The Grid Columns */}
        {matrix.map((col, colIndex) => (
          <View key={colIndex} style={[styles.weekColumn, { marginRight: gap }]}>
            {/* Month header */}
            <View style={styles.monthHeaderContainer}>
              <Text style={styles.monthLabelText} numberOfLines={1}>
                {col.monthLabel || ''}
              </Text>
            </View>

            {/* 7 Days in Week */}
            {col.days.map(day => {
              const level = records[day.date] || 0;
              const squareColor = getColor(level, day.isFuture);

              return (
                <TouchableOpacity
                  key={day.date}
                  activeOpacity={day.isFuture ? 1 : 0.6}
                  disabled={day.isFuture}
                  onPress={() => onDayPress?.(day.date, level)}
                  style={[
                    styles.pixelSquare,
                    {
                      width: squareSize,
                      height: squareSize,
                      backgroundColor: squareColor,
                      marginBottom: gap,
                      borderColor: level > 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                    },
                  ]}
                />
              );
            })}
          </View>
        ))}
      </ScrollView>

      {showLegend && (
        <View style={styles.legendContainer}>
          <Text style={styles.legendText}>Less</Text>
          <View style={styles.legendColors}>
            {palette.levels.map((color, index) => (
              <View
                key={index}
                style={[
                  styles.legendSquare,
                  {
                    backgroundColor: color,
                    marginHorizontal: 2,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={styles.legendText}>More</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },
  dayLabelsColumn: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  dayLabelCell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayLabelText: {
    color: '#6e7681',
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
  weekColumn: {
    flexDirection: 'column',
  },
  monthHeaderContainer: {
    height: 16,
    justifyContent: 'center',
  },
  monthLabelText: {
    color: '#8b949e',
    fontSize: 10,
    fontWeight: '500',
  },
  pixelSquare: {
    borderRadius: 2.5,
    borderWidth: 0.5,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
    marginRight: 6,
  },
  legendText: {
    color: '#6e7681',
    fontSize: 10,
    fontWeight: '500',
  },
  legendColors: {
    flexDirection: 'row',
    marginHorizontal: 6,
  },
  legendSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.06)',
  },
});
