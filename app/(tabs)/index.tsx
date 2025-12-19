import ArcChart from "@/components/chartComponents/MacroCharts/ArcChart";
import { SimpleChartCarbsGoal, SimpleChartFatGoal, SimpleChartProteinGoal } from "@/components/chartComponents/SimpleChart/SimpleChartGoal";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import { H1 } from "@/components/UIComponents/Typography";
import { useGetNutriGoals } from "@/db/hooks/goals/nutritionGoal";
import { useGetFoodItemSum } from "@/db/hooks/history/foodItemhistory";
import { colors } from "@/theme";
import { StyleSheet, View } from "react-native";

export default function Index() {
    const date = new Date()
    const {data: LiveFood, isLoading: liveFoodLoading, error: liveFoodError} = useGetFoodItemSum(
        new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        new Date(date.getFullYear(), date.getMonth(), date.getDate(), 24)
    )
    const {data: currentGoal, isLoading: currentGoalLoading, error: currentGoalError} = useGetNutriGoals()
    
    console.log('the number is', Number('.2'))
    if (liveFoodLoading || currentGoalLoading) {
        return <H1>loading</H1>
    }
    return (
        <View
            style={styles.container}
        >
            <HeaderSimple title={"MACROLET"}/>
            <View style={styles.chartContainer}>
                <H1>Calorie Intake</H1>
                <ArcChart targetPercentage={/*currentGoal?.[0]?.calories*/ 2500} dailyProgress={1300}/>
                <View style={styles.macroChartContainer}>
                    <SimpleChartProteinGoal target={currentGoal?.[0]?.protein} progress={85} backgroundColor={colors.off_white}/>
                    <SimpleChartCarbsGoal target={currentGoal?.[0]?.carbs} progress={85} backgroundColor={colors.off_white}/>
                    <SimpleChartFatGoal target={currentGoal?.[0]?.fat} progress={85} backgroundColor={colors.off_white}/>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    chartContainer: {
        backgroundColor: colors.white,
        padding: 20
    },
    macroChartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

})
