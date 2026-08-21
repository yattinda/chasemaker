import React from 'react';
import { Modal, Pressable, StyleSheet, Text } from 'react-native';
import { DURATION_OPTIONS } from './pacing';

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
        <Pressable style={styles.modalPanel} onPress={() => undefined}>
          <Text style={styles.modalTitle}>時間を選択</Text>
          {DURATION_OPTIONS.map((option) => (
            <Pressable
              key={option}
              onPress={() => onSelect(option)}
              style={[
                styles.optionItem,
                option === durationHours && styles.optionItemSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionItemText,
                  option === durationHours && styles.optionItemTextSelected,
                ]}
              >
                {option}時間
              </Text>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    justifyContent: 'flex-end',
  },
  modalPanel: {
    backgroundColor: '#161310',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 32,
  },
  modalTitle: {
    color: 'rgba(244, 238, 228, 0.58)',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 1.4,
    marginBottom: 14,
  },
  optionItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 246, 232, 0.05)',
  },
  optionItemSelected: {
    backgroundColor: '#F3D7A0',
  },
  optionItemText: {
    color: '#F4EEE4',
    fontSize: 17,
    fontWeight: '400',
  },
  optionItemTextSelected: {
    color: '#1A140C',
    fontWeight: '600',
  },
});
