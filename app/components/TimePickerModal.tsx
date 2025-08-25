import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const hours = ['09', '10', '11', '12', '13', '14', '15', '16', '17', '18'];
const minutes = ['00', '15', '30', '45'];

type TimePickerModalProps = {
  readonly visible: boolean;
  readonly selectedHour: string;
  readonly selectedMinute: string;
  readonly setSelectedHour: (v: string) => void;
  readonly setSelectedMinute: (v: string) => void;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
};

export default function TimePickerModal({
  visible,
  selectedHour,
  selectedMinute,
  setSelectedHour,
  setSelectedMinute,
  onConfirm,
  onClose,
}: TimePickerModalProps) {
  const now = new Date();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>選擇取貨時間</Text>
          <View style={styles.pickerRow}>
            <Picker
              selectedValue={selectedHour}
              style={{ flex: 1 }}
              itemStyle={styles.pickerItem}
              onValueChange={setSelectedHour}
            >
              {hours
                .filter((h) => parseInt(h) >= now.getHours())
                .map((hour) => (
                  <Picker.Item key={hour} label={`${hour} 時`} value={hour} />
                ))}
            </Picker>
            <Picker
              selectedValue={selectedMinute}
              style={{ flex: 1 }}
              itemStyle={styles.pickerItem}
              onValueChange={setSelectedMinute}
            >
              {minutes
                .filter((minute) => {
                  const time = new Date();
                  time.setHours(parseInt(selectedHour));
                  time.setMinutes(parseInt(minute));
                  return time.getTime() > now.getTime();
                })
                .map((minute) => (
                  <Picker.Item key={minute} label={`${minute} 分`} value={minute} />
                ))}
            </Picker>
          </View>
          <TouchableOpacity onPress={onConfirm} style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>確定時間</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '80%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pickerRow: {
    flexDirection: 'row',
  },
  pickerItem: {
    fontSize: 20,
    color: '#000',
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: '#2D5B50',
    padding: 10,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
