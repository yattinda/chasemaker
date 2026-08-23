import { Button, Surface, Text } from '@react-native-material/core';
import React from 'react';
import { Modal, Pressable, StyleSheet } from 'react-native';
import { DURATION_OPTIONS } from './pacing';
import { colors, fontFamily } from './theme';

type Props = {
  visible: boolean;
  durationHours: number;
  onClose: () => void;
  onSelect: (hours: number) => void;
};

export default function DurationPickerModal({
  visible,
  durationHours,
  onClose,
  onSelect,
}: Props) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.sheetWrap} onPress={() => undefined}>
          <Surface elevation={0} category="medium" style={styles.modalPanel}>
            <Text variant="overline" color={colors.muted} style={styles.modalTitle}>
              時間を選択
            </Text>
            {DURATION_OPTIONS.map((option) => {
              const selected = option === durationHours;
              return (
                <Button
                  key={option}
                  variant={selected ? 'contained' : 'text'}
                  color={selected ? 'primary' : 'secondary'}
                  uppercase={false}
                  title={`${option}時間`}
                  onPress={() => onSelect(option)}
                  style={styles.fullWidth}
                  contentContainerStyle={styles.optionItem}
                  titleStyle={selected ? styles.optionItemTextSelected : styles.optionItemText}
                />
              );
            })}
          </Surface>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetWrap: {
    width: '100%',
  },
  modalPanel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 4,
  },
  modalTitle: {
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  fullWidth: {
    width: '100%',
  },
  optionItem: {
    height: 48,
    justifyContent: 'flex-start',
  },
  optionItemText: {
    fontFamily: fontFamily.body,
    fontSize: 16,
  },
  optionItemTextSelected: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 16,
  },
});
