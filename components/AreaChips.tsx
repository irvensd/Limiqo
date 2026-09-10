import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import ConfirmSheet from "@/components/ConfirmSheet";
import { colors, fonts } from "@/constants/theme";
import type { Area } from "@/lib/data";
import { useStore } from "@/lib/store";

export default function AreaChips({
  value,
  onChange,
}: {
  value: Area;
  onChange: (area: Area) => void;
}) {
  const { state, dispatch } = useStore();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [remove, setRemove] = useState<string | null>(null);
  const fallback = state.areas.find((area) => area !== remove) ?? state.areas[0];

  function addArea() {
    const name = draft.trim();
    if (!name) return;
    const match = state.areas.find((area) => area.toLowerCase() === name.toLowerCase());
    const next = match ?? name;
    if (!match) dispatch({ type: "add-area", name: next });
    onChange(next);
    setDraft("");
    setAdding(false);
  }

  return (
    <View>
      <Text style={styles.hint}>
        Starter lanes for this app. Add your own if none fit. Delete a lane if it no longer belongs.
      </Text>
      <View style={styles.row}>
        {state.areas.map((area) => {
          const active = area === value;
          return (
            <Pressable
              key={area}
              onPress={() => onChange(area)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.label, active && styles.labelActive]}>{area}</Text>
            </Pressable>
          );
        })}
        <Pressable onPress={() => setAdding((open) => !open)} style={styles.chip}>
          <Text style={styles.label}>{adding ? "Cancel" : "Add a lane"}</Text>
        </Pressable>
      </View>
      {adding ? (
        <View style={styles.addRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="e.g. Family, Money, School"
            placeholderTextColor={colors.mutedForeground}
            style={styles.input}
            autoFocus
            onSubmitEditing={addArea}
            returnKeyType="done"
          />
          <Pressable onPress={addArea} style={styles.addSave}>
            <Text style={styles.addSaveText}>Add</Text>
          </Pressable>
        </View>
      ) : null}
      {state.areas.length > 1 ? (
        <Pressable onPress={() => setRemove(value)} hitSlop={8} style={styles.delete}>
          <Text style={styles.deleteText}>Delete this lane</Text>
        </Pressable>
      ) : (
        <Text style={styles.keep}>Keep at least one lane.</Text>
      )}
      <ConfirmSheet
        open={Boolean(remove)}
        kicker="Lanes"
        heading="Delete this lane?"
        body={
          remove
            ? `${remove} leaves the list. Anything in it moves to ${fallback}.`
            : "This lane leaves the list."
        }
        confirmLabel="Delete"
        destructive
        onClose={() => setRemove(null)}
        onConfirm={() => {
          if (!remove) return;
          dispatch({ type: "delete-area", name: remove });
          if (value === remove) onChange(fallback);
          setRemove(null);
        }}
      />
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
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    color: colors.foreground,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  addSave: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addSaveText: {
    color: colors.primaryForeground,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  delete: {
    marginTop: 12,
    alignSelf: "flex-start",
  },
  deleteText: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  keep: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: fonts.regular,
    marginTop: 12,
  },
});
