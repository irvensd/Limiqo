import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/constants/theme";
import { useStore } from "@/lib/store";

export default function ProjectChips({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  const { state } = useStore();
  const options = state.projects.filter(
    (project) => project.status !== "archived" || project.id === value,
  );

  if (state.projects.length === 0) {
    return (
      <Text style={styles.hint}>
        No projects yet. Create one first if this aim belongs to a body of work.
      </Text>
    );
  }

  return (
    <View>
      <Text style={styles.hint}>Optional. Only if this aim belongs to a body of work.</Text>
      <View style={styles.row}>
        <Pressable
          onPress={() => onChange(null)}
          style={[styles.chip, value === null && styles.chipActive]}
        >
          <Text style={[styles.label, value === null && styles.labelActive]}>None</Text>
        </Pressable>
        {options.map((project) => {
          const active = project.id === value;
          return (
            <Pressable
              key={project.id}
              onPress={() => onChange(project.id)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.label, active && styles.labelActive]}>{project.name}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hint: {
    color: colors.mutedForeground,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fonts.regular,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.secondary,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  label: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  labelActive: {
    color: colors.primaryForeground,
  },
});
