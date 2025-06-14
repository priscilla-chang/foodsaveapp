import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  readonly status: '已確認' | '準備中' | '準備完成';
}

const steps = ['已確認', '準備中', '準備完成'];

export default function ProgressStepper({ status }: Props) {
  const currentIndex = steps.indexOf(status);

  return (
    <View style={styles.container}>
      <View style={styles.progressRow}>
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          let circleStyle = styles.circleInactive;
          if (isCompleted) circleStyle = styles.circleCompleted;
          else if (isCurrent) circleStyle = styles.circleCurrent;

          const lineStyle =
            index < currentIndex ? styles.lineActive : styles.lineInactive;

          return (
            <React.Fragment key={step}>
              <View style={styles.stepContainer}>
                <View style={[styles.circle, circleStyle]}>
                  {isCurrent && (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  )}
                </View>
              </View>

              {index < steps.length - 1 && (
                <View style={[styles.line, lineStyle]} />
              )}
            </React.Fragment>
          );
        })}
      </View>

      <View style={styles.labelRow}>
        {steps.map((step, index) => (
          <Text
            key={step}
            style={[
              styles.stepLabel,
              index === currentIndex && styles.stepLabelActive,
            ]}
          >
            {step}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleCompleted: {
    backgroundColor: '#FFA500',
  },
  circleCurrent: {
    backgroundColor: '#FFA500',
  },
  circleInactive: {
    backgroundColor: '#ddd',
  },
  line: {
    width: 36,
    height: 2,
    marginHorizontal: 2,
    alignSelf: 'center',
  },
  lineActive: {
    backgroundColor: '#FFA500',
  },
  lineInactive: {
    backgroundColor: '#ddd',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    width: 200,
  },
  stepLabel: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  stepLabelActive: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
