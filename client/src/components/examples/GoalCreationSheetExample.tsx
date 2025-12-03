import GoalCreationSheet from '../GoalCreationSheet';

export default function GoalCreationSheetExample() {
  return (
    <div className="p-4">
      <GoalCreationSheet
        onSubmit={(goal) => console.log('Goal created:', goal)}
      />
    </div>
  );
}
