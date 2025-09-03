import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 🔥 定義分鐘型別（並 export 出去給其他檔案用）
export type Minute15 = '00' | '15' | '30' | '45';

// 小時範圍 09–18
const HOURS = Array.from({ length: 10 }, (_, i) =>
  (9 + i).toString().padStart(2, '0')
);
const MINUTES: Minute15[] = ['00', '15', '30', '45'];

type Props = {
  readonly visible: boolean;
  readonly selectedHour: string;
  readonly selectedMinute: Minute15;
  readonly setSelectedHour: (v: string) => void;
  readonly setSelectedMinute: (v: Minute15) => void;
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
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>選擇取貨時間</Text>

          <View style={styles.pickerRow}>
            <Picker
              selectedValue={selectedHour}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              onValueChange={(v) => setSelectedHour(v)}
            >
              {HOURS.map((h) => (
                <Picker.Item key={h} label={`${h} 時`} value={h} />
              ))}
            </Picker>

            <Picker
              selectedValue={selectedMinute}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              onValueChange={(v) => setSelectedMinute(v as Minute15)}
            >
              {MINUTES.map((m) => (
                <Picker.Item key={m} label={`${m} 分`} value={m} />
              ))}
            </Picker>
          </View>

          <TouchableOpacity onPress={onConfirm} style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>確定時間</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            style={[styles.confirmButton, { backgroundColor: '#aaa', marginTop: 8 }]}
          >
            <Text style={styles.confirmButtonText}>取消</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  container: { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: '80%' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  pickerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  picker: { flex: 1, height: 200, backgroundColor: '#fff' },
  pickerItem: { fontSize: 22, color: '#000' },
  confirmButton: { marginTop: 20, backgroundColor: '#2D5B50', padding: 12, borderRadius: 8 },
  confirmButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
