import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import Papa from 'papaparse';
import foodDatajson from './fooddata.json';
import * as NavigationBar from 'expo-navigation-bar';
import { LinearGradient } from 'expo-linear-gradient';

NavigationBar.setBackgroundColorAsync("white");



export default function App() {
    const [calorieCalculatorVisible, setCalorieCalculatorVisible] = useState(false);
    const [foodData, setFoodData] = useState([]);
    const [showAlternativeFoods, setShowAlternativeFoods] = useState(false);
    const [expandedActivityPlan, setExpandedActivityPlan] = useState(false);
    const [collapsedHeight, setCollapsedHeight] = useState(300);

    const vitals = {
        bpm: 80,
        spo2: 95,
        systolic: 120,
        diastolic: 80,
        weight: 50, // kg
        age: 18,
        activityLevel: "Sedentary", // Changed to sedentary for demo
        height: 165, // cm
        gender: "Male",
        dietaryGoals: "Weight gain",
        weeklyExerciseHours: 0, // Added weekly exercise tracking
        lastWorkout: "90 days ago" // Added last workout tracking
    };

    useEffect(() => {
      setFoodData(foodDatajson);
      console.log(`Loaded ${foodData.length} food items`);
    }, []);

    const calculateBMI = () => {
        const heightInMeters = vitals.height / 100;
        const bmi = vitals.weight / (heightInMeters * heightInMeters);
        return {
            value: bmi.toFixed(1),
            category: bmi < 18.5 ? "Underweight" :
                     bmi < 25 ? "Normal" :
                     bmi < 30 ? "Overweight" : "Obese"
        };
    };

    const calculateTDEE = () => {
        let bmr;
        if (vitals.gender === "Male") {
            bmr = 88.36 + (13.4 * vitals.weight) + (4.8 * vitals.height) - (5.7 * vitals.age);
        } else {
            bmr = 447.6 + (9.2 * vitals.weight) + (3.1 * vitals.height) - (4.3 * vitals.age);
        }

        const activityMultipliers = {
            "Sedentary": 1.2,
            "Light": 1.375,
            "Moderate": 1.55,
            "Active": 1.725,
            "Very Active": 1.9
        };

        const baseTDEE = Math.round(bmr * activityMultipliers[vitals.activityLevel]);
        const bmi = calculateBMI();
        
        // Adjust TDEE based on BMI category
        if (bmi.category === "Underweight") {
            return Math.round(baseTDEE * 1.15); // Increase calories for weight gain
        } else if (bmi.category === "Overweight" || bmi.category === "Obese") {
            return Math.round(baseTDEE * 0.85); // Decrease calories for weight loss
        }
        return baseTDEE;
    };

    const recommendDiet = () => {
      const tdee = calculateTDEE();
      const bmi = calculateBMI();
      let protein, carbs, fats;
      let recommendations = [];
  
      if (bmi.category === "Underweight") {
        protein = Math.round(vitals.weight * 2.2);
        carbs = Math.round(tdee * 0.55 / 4);
        fats = Math.round(tdee * 0.25 / 9);
        recommendations.push("Focus on calorie-dense, nutrient-rich foods");
      } else if (bmi.category === "Overweight" || bmi.category === "Obese") {
        protein = Math.round(vitals.weight * 2);
        carbs = Math.round(tdee * 0.35 / 4);
        fats = Math.round(tdee * 0.25 / 9);
        recommendations.push("Prioritize lean proteins and vegetables");
      } else {
        protein = Math.round(vitals.weight * 1.8);
        carbs = Math.round(tdee * 0.45 / 4);
        fats = Math.round(tdee * 0.3 / 9);
      }
  
      return {
        tdee,
        protein,
        carbs,
        fats,
        recommendations,
        macros: [
          { label: "Protein", value: `${protein}g/day`, icon: "food-drumstick" },
          { label: "Carbs", value: `${carbs}g/day`, icon: "food-apple" },
          { label: "Fats", value: `${fats}g/day`, icon: "food" },
          { label: "Total Calories", value: `${tdee} kcal`, icon: "fire" }
        ]
      };
    };

    // Search algorithm to suggest foods based on one meal's targets (assumes 3 meals per day)
    const getSuggestedFoods = () => {
        const dietRec = recommendDiet();
        // Ideal per meal values
        const idealMealCalories = dietRec.tdee / 3;
        const idealMealProtein = dietRec.protein / 3;
        const idealMealCarbs = dietRec.carbs / 3;
        const idealMealFats = dietRec.fats / 3;

        // Score each food based on how close it is to the ideal values
        const scoredFoods = foodData.map(food => {
          const calorieDiff = Math.abs(food.unit_serving_energy_kcal - idealMealCalories) / idealMealCalories;
          const proteinDiff = Math.abs(food.unit_serving_protein_g - idealMealProtein) / idealMealProtein;
          const carbDiff = Math.abs(food.unit_serving_carb_g - idealMealCarbs) / idealMealCarbs;
          const fatDiff = Math.abs(food.unit_serving_fat_g - idealMealFats) / idealMealFats;
          const score = calorieDiff + proteinDiff + carbDiff + fatDiff;
          return { ...food, score };
        });
        scoredFoods.sort((a, b) => a.score - b.score);
        
        const cleanFoodName = (name) => name.replace(/\s*\([^)]*\)/g, '');
        
        return showAlternativeFoods ? 
          scoredFoods.slice(3, 6).map(food => ({...food, food_name: cleanFoodName(food.food_name)})) :
          scoredFoods.slice(0, 3).map(food => ({...food, food_name: cleanFoodName(food.food_name)}));
    };

    const getMedicalAlerts = () => {
        const alerts = [];
        const bmi = calculateBMI();
        
        if (vitals.bpm > 120) {
            alerts.push({
                severity: 'high',
                message: 'Elevated heart rate detected',
                icon: 'heart-flash',
                recommendation: 'Consider reducing physical activity'
            });
        }
        if (vitals.spo2 < 95) {
            alerts.push({
                severity: 'high',
                message: 'Low oxygen saturation',
                icon: 'lungs',
                recommendation: 'Seek immediate medical attention'
            });
        }
        if (vitals.systolic > 130 || vitals.diastolic > 85) {
            alerts.push({
                severity: 'medium',
                message: 'Blood pressure above normal range',
                icon: 'heart-pulse',
                recommendation: 'Monitor and consult healthcare provider'
            });
        }
        
        // BMI-based alerts
        if (bmi.category === "Underweight") {
            alerts.push({
                severity: 'medium',
                message: `BMI: ${bmi.value} - Underweight`,
                icon: 'scale-bathroom',
                recommendation: 'Increase caloric intake and start strength training'
            });
        } else if (bmi.category === "Overweight" || bmi.category === "Obese") {
            alerts.push({
                severity: 'medium',
                message: `BMI: ${bmi.value} - ${bmi.category}`,
                icon: 'scale-bathroom',
                recommendation: 'Focus on caloric deficit and regular exercise'
            });
        }

        // Exercise-based alerts
        if (vitals.weeklyExerciseHours < 5) {
            alerts.push({
                severity: 'medium',
                message: 'Insufficient physical activity',
                icon: 'run',
                recommendation: 'Aim for at least 5 hours of exercise per week'
            });
        }
        if (vitals.lastWorkout === "3 days ago") {
            alerts.push({
                severity: 'low',
                message: 'Time for a workout!',
                icon: 'weight-lifter',
                recommendation: 'Maintain regular exercise schedule'
            });
        }

        return alerts;
    };

    const getPhysicalActivityPlan = () => {
      const plans = {
          cardio: [],
          strength: [],
          flexibility: [],
          balance: [] // Added balance section for older adults
      };
  
      const bmi = calculateBMI();
      const isUnderactive = vitals.weeklyExerciseHours < 5;
      const age = vitals.age;
      const gender = vitals.gender;
      const weight = vitals.weight;
      const height = vitals.height;
      
      // Determine age category
      const isChild = age < 13;
      const isTeen = age >= 13 && age <= 19;
      const isYoungAdult = age >= 20 && age <= 35;
      const isMiddleAged = age >= 36 && age <= 55;
      const isSenior = age >= 56;
      
      // Determine if growing (children/teens)
      const isGrowing = age < 20;
      
      // Calculate intensity recommendations based on activity level
      let recommendedIntensity = "Moderate";
      if (vitals.weeklyExerciseHours > 10) {
          recommendedIntensity = "Moderate to High";
      } else if (vitals.weeklyExerciseHours < 2) {
          recommendedIntensity = "Low to Moderate";
      }
      
      // UNDERWEIGHT RECOMMENDATIONS
      if (bmi.category === "Underweight") {
          plans.nutrition = "Focus on protein-rich foods, complex carbohydrates, and healthy fats. Consider adding 300-500 calories above maintenance.";
          
          if (isGrowing) {
              // For growing underweight children/teens
              plans.cardio = [
                  { activity: "Swimming", duration: "20-30 mins", frequency: "2x/week", intensity: "Low to moderate", benefits: "Full-body, low-impact cardiovascular exercise" },
                  { activity: "Light Jogging", duration: "15-20 mins", frequency: "2x/week", intensity: "Low", benefits: "Builds endurance without excessive calorie burn" },
                  { activity: "Recreational Sports", duration: "30-45 mins", frequency: "2-3x/week", intensity: "Varies", benefits: "Fun, social, and builds fundamental movement skills" }
              ];
              plans.strength = [
                  { activity: "Bodyweight Exercises", duration: "20-30 mins", frequency: "3x/week", focus: "Progressive foundation building", benefits: "Safe for growing bodies, builds fundamental strength" },
                  { activity: "Resistance Bands", duration: "20 mins", frequency: "2x/week", focus: "Full body, controlled movements", benefits: "Low risk of injury, adaptable resistance" }
              ];
              plans.flexibility = [
                  { activity: "Dynamic Stretching", duration: "10 mins", frequency: "Daily", focus: "Pre-activity", benefits: "Prepares muscles and joints for movement" },
                  { activity: "Youth Yoga", duration: "20 mins", frequency: "2-3x/week", focus: "Age-appropriate poses", benefits: "Improves flexibility and body awareness" }
              ];
          } else if (isYoungAdult || isMiddleAged) {
              // For underweight adults
              plans.cardio = [
                  { activity: "Elliptical Training", duration: "20-30 mins", frequency: "2-3x/week", intensity: "Moderate", benefits: "Low-impact, controlled cardio" },
                  { activity: "Swimming", duration: "30 mins", frequency: "2x/week", intensity: "Low to moderate", benefits: "Full-body exercise with minimal joint stress" },
                  { activity: "Recreational Cycling", duration: "20-30 mins", frequency: "2x/week", intensity: "Moderate", benefits: "Lower body strength and endurance" }
              ];
              plans.strength = [
                  { activity: "Weight Training", duration: "40-50 mins", frequency: "3-4x/week", focus: "Progressive overload, compound movements", benefits: "Builds muscle mass efficiently" },
                  { activity: "Bodyweight Exercises", duration: "30 mins", frequency: "2-3x/week", focus: "Form and technique", benefits: "Foundation for more advanced lifting" },
                  { activity: "Medicine Ball Workouts", duration: "20 mins", frequency: "2x/week", focus: "Power and coordination", benefits: "Functional strength development" }
              ];
          } else if (isSenior) {
              // For underweight seniors
              plans.cardio = [
                  { activity: "Walking", duration: "20-30 mins", frequency: "4-5x/week", intensity: "Low to moderate", benefits: "Gentle aerobic activity" },
                  { activity: "Stationary Cycling", duration: "15-20 mins", frequency: "3x/week", intensity: "Low", benefits: "Joint-friendly cardio option" },
                  { activity: "Water Aerobics", duration: "30 mins", frequency: "2x/week", intensity: "Low", benefits: "Supportive environment for movement" }
              ];
              plans.strength = [
                  { activity: "Light Resistance Training", duration: "20-30 mins", frequency: "2-3x/week", focus: "Major muscle groups, controlled movement", benefits: "Preserves and builds muscle mass" },
                  { activity: "Chair Exercises", duration: "15-20 mins", frequency: "3x/week", focus: "Functional strength", benefits: "Safe, supportive environment" }
              ];
              plans.balance = [
                  { activity: "Tai Chi", duration: "20 mins", frequency: "2-3x/week", focus: "Balance and coordination", benefits: "Improves stability and reduces fall risk" },
                  { activity: "Standing Balance Exercises", duration: "10 mins", frequency: "Daily", focus: "Single-leg stability", benefits: "Strengthens stabilizing muscles" }
              ];
          }
      }
      
      // NORMAL WEIGHT RECOMMENDATIONS
      else if (bmi.category === "Normal") {
          if (isChild) {
              // For normal weight children
              plans.cardio = [
                  { activity: "Active Play", duration: "60+ mins", frequency: "Daily", intensity: "Varies", benefits: "Natural movement patterns, fun, social development" },
                  { activity: "Swimming", duration: "30 mins", frequency: "2x/week", intensity: "Moderate", benefits: "Full-body exercise, water safety skills" },
                  { activity: "Cycling", duration: "20-30 mins", frequency: "2-3x/week", intensity: "Moderate", benefits: "Develops coordination and endurance" }
              ];
              plans.strength = [
                  { activity: "Playground Activities", duration: "30 mins", frequency: "3-4x/week", focus: "Climbing, hanging, pushing", benefits: "Natural resistance training" },
                  { activity: "Bodyweight Games", duration: "20 mins", frequency: "3x/week", focus: "Fun challenges", benefits: "Age-appropriate strength building" }
              ];
          } else if (isTeen) {
              // For normal weight teens
              const teenGender = gender === "Male" ? 
                  // Male teen activities
                  {
                      cardio: [
                          { activity: "Running", duration: "20-30 mins", frequency: "3x/week", intensity: "Moderate to high", benefits: "Cardiovascular fitness, bone density" },
                          { activity: "Team Sports", duration: "60 mins", frequency: "2-3x/week", intensity: "Varies", benefits: "Social interaction, varied movement patterns" },
                          { activity: "Swimming", duration: "30-45 mins", frequency: "2x/week", intensity: "Moderate", benefits: "Full-body, non-impact exercise" }
                      ],
                      strength: [
                          { activity: "Bodyweight Training", duration: "30-40 mins", frequency: "3x/week", focus: "Push-ups, pull-ups, squats", benefits: "Foundational strength before weightlifting" },
                          { activity: "Light Weight Training", duration: "40 mins", frequency: "2-3x/week", focus: "Proper form, controlled movements", benefits: "Builds muscle safely during growth" }
                      ]
                  } : 
                  // Female teen activities
                  {
                      cardio: [
                          { activity: "Dance", duration: "30-45 mins", frequency: "2-3x/week", intensity: "Moderate", benefits: "Coordination, rhythmic movement, social" },
                          { activity: "Running/Jogging", duration: "20-30 mins", frequency: "2-3x/week", intensity: "Moderate", benefits: "Cardiovascular health, bone strength" },
                          { activity: "Team Sports", duration: "60 mins", frequency: "2-3x/week", intensity: "Varies", benefits: "Teamwork, varied fitness benefits" }
                      ],
                      strength: [
                          { activity: "Bodyweight Circuits", duration: "30 mins", frequency: "3x/week", focus: "Full-body functional movements", benefits: "Builds strength without bulk" },
                          { activity: "Pilates", duration: "30-45 mins", frequency: "2x/week", focus: "Core and postural muscles", benefits: "Balanced muscle development" }
                      ]
                  };
              
              plans.cardio = teenGender.cardio;
              plans.strength = teenGender.strength;
          } else if (isYoungAdult) {
              // For normal weight young adults
              if (gender === "Male") {
                  plans.cardio = [
                      { activity: "Running", duration: "30-45 mins", frequency: "3-4x/week", intensity: "Moderate to high", benefits: "Cardiovascular endurance, calorie burning" },
                      { activity: "HIIT", duration: "20-30 mins", frequency: "2x/week", intensity: "High", benefits: "Efficient workout, metabolic boost" },
                      { activity: "Cycling", duration: "45-60 mins", frequency: "2x/week", intensity: "Moderate to high", benefits: "Lower body strength, endurance" }
                  ];
                  plans.strength = [
                      { activity: "Weight Training", duration: "45-60 mins", frequency: "3-4x/week", focus: "Major muscle groups, progressive overload", benefits: "Muscle development, metabolic health" },
                      { activity: "Functional Training", duration: "30-45 mins", frequency: "2x/week", focus: "Movement patterns, core stability", benefits: "Translates to daily activities" }
                  ];
              } else {
                  plans.cardio = [
                      { activity: "Running/Jogging", duration: "30-40 mins", frequency: "3x/week", intensity: "Moderate", benefits: "Cardiovascular health, bone density" },
                      { activity: "Kickboxing", duration: "45 mins", frequency: "1-2x/week", intensity: "High", benefits: "Full-body workout, stress relief" },
                      { activity: "Cycling", duration: "30-45 mins", frequency: "2x/week", intensity: "Moderate", benefits: "Lower body strength, low-impact cardio" }
                  ];
                  plans.strength = [
                      { activity: "Weight Training", duration: "40-50 mins", frequency: "2-3x/week", focus: "Full body, moderate resistance", benefits: "Toning, strength without bulk" },
                      { activity: "Barre", duration: "45 mins", frequency: "2x/week", focus: "Small, controlled movements", benefits: "Muscular endurance, posture improvement" },
                      { activity: "Bodyweight Circuit", duration: "30 mins", frequency: "2x/week", focus: "Compound movements", benefits: "Functional strength, no equipment needed" }
                  ];
              }
          } else if (isMiddleAged) {
              // For normal weight middle-aged adults
              plans.cardio = [
                  { activity: "Brisk Walking", duration: "30-45 mins", frequency: "4-5x/week", intensity: "Moderate", benefits: "Heart health with lower injury risk" },
                  { activity: "Swimming", duration: "30-45 mins", frequency: "2-3x/week", intensity: "Moderate", benefits: "Joint-friendly full-body workout" },
                  { activity: "Rowing", duration: "20-30 mins", frequency: "2x/week", intensity: "Moderate to high", benefits: "Upper and lower body workout" }
              ];
              plans.strength = [
                  { activity: "Weight Training", duration: "40-50 mins", frequency: "2-3x/week", focus: "Major muscle groups, proper form", benefits: "Maintains muscle mass, supports metabolism" },
                  { activity: "Resistance Bands", duration: "30 mins", frequency: "2x/week", focus: "Multi-joint movements", benefits: "Joint-friendly resistance" },
                  { activity: "Bodyweight Exercises", duration: "30 mins", frequency: "2x/week", focus: "Functional movement patterns", benefits: "Practical strength for daily life" }
              ];
          } else if (isSenior) {
              // For normal weight seniors
              plans.cardio = [
                  { activity: "Walking", duration: "30 mins", frequency: "5x/week", intensity: "Low to moderate", benefits: "Accessible, social, improves stamina" },
                  { activity: "Swimming", duration: "30 mins", frequency: "2-3x/week", intensity: "Low to moderate", benefits: "No impact on joints, full-body movement" },
                  { activity: "Stationary Cycling", duration: "20-30 mins", frequency: "3x/week", intensity: "Low to moderate", benefits: "Seated exercise, easy on knees" }
              ];
              plans.strength = [
                  { activity: "Light Dumbbell Training", duration: "30 mins", frequency: "2-3x/week", focus: "Major muscle groups, controlled movement", benefits: "Maintains strength and function" },
                  { activity: "Resistance Band Work", duration: "20-30 mins", frequency: "2-3x/week", focus: "Full range of motion", benefits: "Gentle on joints, adaptable resistance" }
              ];
              plans.balance = [
                  { activity: "Tai Chi", duration: "20-30 mins", frequency: "3x/week", focus: "Slow, controlled movements", benefits: "Improves balance, reduces fall risk" },
                  { activity: "Standing Balance Exercises", duration: "10-15 mins", frequency: "Daily", focus: "Static and dynamic balance", benefits: "Fall prevention, confidence" },
                  { activity: "Yoga for Seniors", duration: "30 mins", frequency: "2x/week", focus: "Modified poses for older adults", benefits: "Flexibility, balance, and mental focus" }
              ];
          }
      }
      
      // OVERWEIGHT RECOMMENDATIONS
      else if (bmi.category === "Overweight") {
          plans.nutrition = "Create a modest calorie deficit through portion control and focus on nutrient-dense foods. Limit processed foods and added sugars.";
          
          if (isChild || isTeen) {
              // For overweight youth
              plans.cardio = [
                  { activity: "Swimming", duration: "30-45 mins", frequency: "3x/week", intensity: "Moderate", benefits: "Full-body exercise without joint stress" },
                  { activity: "Cycling", duration: "20-30 mins", frequency: "3x/week", intensity: "Moderate", benefits: "Lower impact on joints than running" },
                  { activity: "Active Play/Sports", duration: "45-60 mins", frequency: "Daily", intensity: "Varies", benefits: "Fun, engaging way to increase activity" }
              ];
              plans.strength = [
                  { activity: "Bodyweight Exercises", duration: "20-30 mins", frequency: "3x/week", focus: "Fundamental movements", benefits: "Builds muscle, increases metabolism" },
                  { activity: "Circuit Training", duration: "20-30 mins", frequency: "2x/week", focus: "Full body with minimal rest", benefits: "Combines strength and cardio benefits" }
              ];
              plans.flexibility = [
                  { activity: "Dynamic Stretching", duration: "10 mins", frequency: "Daily", focus: "Major muscle groups", benefits: "Improves range of motion for activities" },
                  { activity: "Yoga for Youth", duration: "30 mins", frequency: "2x/week", focus: "Age-appropriate poses", benefits: "Body awareness and mobility" }
              ];
          } else if (isYoungAdult || isMiddleAged) {
              // For overweight adults
              plans.cardio = [
                  { activity: "Brisk Walking", duration: "30-45 mins", frequency: "5-6x/week", intensity: "Moderate", benefits: "Accessible, low-impact, burns calories" },
                  { activity: "Elliptical Trainer", duration: "30 mins", frequency: "3x/week", intensity: "Moderate", benefits: "Low-impact cardio option" },
                  { activity: "Water Aerobics", duration: "45 mins", frequency: "2-3x/week", intensity: "Moderate", benefits: "Supports weight, reduces joint stress" },
                  { activity: "Rowing", duration: "20-30 mins", frequency: "2x/week", intensity: "Moderate to high", benefits: "Full-body workout, high calorie burn" }
              ];
              plans.strength = [
                  { activity: "Circuit Training", duration: "30-40 mins", frequency: "3x/week", focus: "Full body, minimal rest", benefits: "Efficient for burning calories and building strength" },
                  { activity: "Resistance Training", duration: "40 mins", frequency: "2-3x/week", focus: "Major muscle groups", benefits: "Increases metabolism and muscle mass" },
                  { activity: "Bodyweight Exercises", duration: "30 mins", frequency: "2-3x/week", focus: "Modified for fitness level", benefits: "Can be done anywhere, builds foundational strength" }
              ];
              plans.flexibility = [
                  { activity: "Static Stretching", duration: "15-20 mins", frequency: "Daily", focus: "Post-workout", benefits: "Increases range of motion, reduces muscle tension" },
                  { activity: "Gentle Yoga", duration: "30-45 mins", frequency: "2-3x/week", focus: "Modified poses as needed", benefits: "Improves flexibility and mindfulness" }
              ];
          } else if (isSenior) {
              // For overweight seniors
              plans.cardio = [
                  { activity: "Walking", duration: "20-30 mins", frequency: "5x/week", intensity: "Low to moderate", benefits: "Low-impact, can be social" },
                  { activity: "Water Walking", duration: "30 mins", frequency: "3x/week", intensity: "Low", benefits: "Reduced weight-bearing stress" },
                  { activity: "Recumbent Bike", duration: "20 mins", frequency: "3x/week", intensity: "Low to moderate", benefits: "Seated position reduces strain" }
              ];
              plans.strength = [
                  { activity: "Seated Resistance Exercises", duration: "20-30 mins", frequency: "2-3x/week", focus: "Major muscle groups", benefits: "Supported positions reduce injury risk" },
                  { activity: "Standing Exercises with Support", duration: "15-20 mins", frequency: "2-3x/week", focus: "Lower body strength", benefits: "Improves mobility and stability" }
              ];
              plans.balance = [
                  { activity: "Seated Tai Chi", duration: "20 mins", frequency: "2-3x/week", focus: "Upper body movements", benefits: "Coordination without balance demands" },
                  { activity: "Supported Standing Balance", duration: "10 mins", frequency: "Daily", focus: "Gradual progression", benefits: "Builds confidence and stability" }
              ];
          }
      }
      
      // OBESE RECOMMENDATIONS
      else if (bmi.category === "Obese") {
          plans.nutrition = "Work with healthcare provider to develop a sustainable calorie deficit. Focus on whole foods, adequate protein, and regular meal timing.";
          
          if (isChild || isTeen) {
              // For obese youth
              plans.cardio = [
                  { activity: "Swimming", duration: "20-30 mins", frequency: "3x/week", intensity: "Low to moderate", benefits: "Supports body weight, reduces joint stress" },
                  { activity: "Walking", duration: "20-30 mins", frequency: "5-6x/week", intensity: "Moderate", benefits: "Accessible, builds endurance safely" },
                  { activity: "Cycling (stationary/recumbent)", duration: "15-20 mins", frequency: "3x/week", intensity: "Low to moderate", benefits: "Supported seated position" }
              ];
              plans.strength = [
                  { activity: "Modified Bodyweight Exercises", duration: "20 mins", frequency: "3x/week", focus: "Adapted movements", benefits: "Builds strength with accommodations" },
                  { activity: "Resistance Bands", duration: "15-20 mins", frequency: "2-3x/week", focus: "Major muscle groups", benefits: "Adjustable resistance, less intimidating" }
              ];
              plans.flexibility = [
                  { activity: "Gentle Stretching", duration: "10-15 mins", frequency: "Daily", focus: "Major muscle groups", benefits: "Improves mobility and comfort" },
                  { activity: "Modified Yoga", duration: "20-30 mins", frequency: "2-3x/week", focus: "Supported poses", benefits: "Increases range of motion safely" }
              ];
          } else if (isYoungAdult || isMiddleAged) {
              // For obese adults
              plans.cardio = [
                  { activity: "Walking", duration: "20-30 mins", frequency: "5-6x/week", intensity: "Low to moderate", benefits: "Low-impact, builds base fitness" },
                  { activity: "Water Walking/Swimming", duration: "30 mins", frequency: "3x/week", intensity: "Low to moderate", benefits: "Buoyancy reduces strain on joints" },
                  { activity: "Recumbent Cycling", duration: "15-20 mins", frequency: "3x/week", intensity: "Low to moderate", benefits: "Back support, reduced joint pressure" },
                  { activity: "Seated Arm Ergometer", duration: "10-15 mins", frequency: "2-3x/week", intensity: "Low to moderate", benefits: "Cardio option with minimal lower body strain" }
              ];
              plans.strength = [
                  { activity: "Seated Resistance Training", duration: "20-30 mins", frequency: "2-3x/week", focus: "Major muscle groups", benefits: "Builds strength in supported positions" },
                  { activity: "Wall Push-ups", duration: "10-15 mins", frequency: "3x/week", focus: "Upper body", benefits: "Modified to reduce weight bearing" },
                  { activity: "Resistance Band Work", duration: "20-30 mins", frequency: "3x/week", focus: "Full body", benefits: "Adaptable resistance levels" }
              ];
              plans.flexibility = [
                  { activity: "Seated Stretching", duration: "15 mins", frequency: "Daily", focus: "Major muscle groups", benefits: "Improves mobility without floor work" },
                  { activity: "Standing Supported Stretches", duration: "10-15 mins", frequency: "Daily", focus: "Gradual range of motion", benefits: "Reduces stiffness, improves comfort" }
              ];
          } else if (isSenior) {
              // For obese seniors
              plans.cardio = [
                  { activity: "Chair Exercises", duration: "15-20 mins", frequency: "5x/week", intensity: "Low", benefits: "Seated position for safety" },
                  { activity: "Water Activities", duration: "20-30 mins", frequency: "2-3x/week", intensity: "Low", benefits: "Reduces pressure on joints" },
                  { activity: "Seated Arm Movements", duration: "10-15 mins", frequency: "Daily", intensity: "Very low", benefits: "Increases circulation, minimal strain" }
              ];
              plans.strength = [
                  { activity: "Seated Resistance Band", duration: "15-20 mins", frequency: "2-3x/week", focus: "Major muscle groups", benefits: "Strengthens without standing" },
                  { activity: "Water Resistance Exercises", duration: "20 mins", frequency: "2x/week", focus: "Full body", benefits: "Natural resistance with buoyancy" }
              ];
              plans.flexibility = [
                  { activity: "Seated Stretching", duration: "10 mins", frequency: "Daily", focus: "Gentle range of motion", benefits: "Maintains mobility" },
                  { activity: "Chair Yoga", duration: "20 mins", frequency: "2-3x/week", focus: "Modified poses", benefits: "Adapts traditional yoga for limited mobility" }
              ];
          }
      }
      
      // Add motivation message for underactive users
      if (isUnderactive) {
          plans.motivation = "💪 Gradually increasing your activity to 5+ hours per week can significantly improve your health! Start with small, consistent steps.";
      }
      
      // Add general flexibility section if it doesn't exist
      if (!plans.flexibility || plans.flexibility.length === 0) {
          plans.flexibility = [
              { activity: "Dynamic Stretching", duration: "10-15 mins", frequency: "Daily", focus: "Pre-workout", benefits: "Prepares muscles for activity" },
              { activity: "Static Stretching", duration: "15-20 mins", frequency: "Daily", focus: "Post-workout", benefits: "Improves flexibility, aids recovery" }
          ];
      }

      if (!plans.balance || plans.balance.length === 0) {
        plans.balance = [
            { activity: "Balance Exercises", duration: "10-15 mins", frequency: "Daily", focus: "Stability", benefits: "Improves balance and coordination" },
            { activity: "Tai Chi", duration: "20-30 mins", frequency: "2-3x/week", focus: "Slow, controlled movements", benefits: "Reduces stress, improves posture" }
        ];
      }
      
      // Add special considerations based on medical alerts
      const hasHighBP = vitals.systolic > 130 || vitals.diastolic > 85;
      const hasHighHR = vitals.bpm > 100;
      const hasLowO2 = vitals.spo2 < 95;
      
      if (hasHighBP || hasHighHR || hasLowO2) {
          plans.medicalConsiderations = [
              "⚠️ Consult with a healthcare provider before starting any exercise program",
              "Begin with lower intensity activities and gradually increase as tolerated",
              "Monitor heart rate and breathing during exercise and stop if experiencing dizziness or chest pain",
              "Focus on consistent, moderate activity rather than intense bursts"
          ];
      }
      
      return plans;
  };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <ScrollView style={styles.scrollView}>
                <Text style={styles.headerText}>Health Dashboard</Text>
                
                {/* BMI Status */}
                <View style={styles.card}>
                    <Text style={styles.cardHeader}>BMI Status</Text>
                    <View style={[styles.bmiBox, styles[`bmi${calculateBMI().category}`]]}>
                        <Text style={styles.bmiValue}>BMI: {calculateBMI().value}</Text>
                        <Text style={styles.bmiCategory}>{calculateBMI().category}</Text>
                    </View>
                </View>

                {/* Vitals Dashboard */}
                {/* <View style={styles.card}>
                    <Text style={styles.cardHeader}>Vitals Dashboard</Text>
                    <View style={styles.vitalsContainer}>
                        <View style={styles.vitalBox}><MaterialCommunityIcons name="heart-pulse" size={24} color="#FF5252" /><Text style={styles.vitalText}>BPM: {vitals.bpm}</Text></View>
                        <View style={styles.vitalBox}><MaterialCommunityIcons name="lungs" size={24} color="#4CAF50" /><Text style={styles.vitalText}>SpO2: {vitals.spo2}%</Text></View>
                        <View style={styles.vitalBox}><MaterialCommunityIcons name="heart" size={24} color="#3F51B5" /><Text style={styles.vitalText}>BP: {vitals.systolic}/{vitals.diastolic} mmHg</Text></View>
                    </View>
                </View> */}

                {/* Activity Status */}
                <View style={styles.card}>
                    <Text style={styles.cardHeader}>Activity Status</Text>
                    <View style={styles.activityStatusContainer}>
                        <View style={styles.activityMetric}>
                            <MaterialCommunityIcons name="clock-time-four" size={24} color="#FF9800" />
                            <Text style={styles.activityMetricText}>Weekly Exercise: {vitals.weeklyExerciseHours} hours</Text>
                        </View>
                        <View style={styles.activityMetric}>
                            <MaterialCommunityIcons name="calendar-clock" size={24} color="#FF9800" />
                            <Text style={styles.activityMetricText}>Last Workout: {vitals.lastWorkout}</Text>
                        </View>
                    </View>
                </View>

                {/* Medical Alerts */}
                {getMedicalAlerts().length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.cardHeader}>
                            <MaterialCommunityIcons name="alert-circle" size={24} color="#FF5252" style={styles.alertIcon} />
                            Medical Alerts
                        </Text>
                        {getMedicalAlerts().map((alert, index) => (
                            <View key={index} style={[styles.alertBox, styles[`alert${alert.severity}`]]}>
                                <View style={styles.alertHeader}>
                                    <MaterialCommunityIcons name={alert.icon} size={24} color="#FFF" />
                                    <Text style={styles.alertMessage}>{alert.message}</Text>
                                </View>
                                <Text style={styles.alertRecommendation}>{alert.recommendation}</Text>
                            </View>
                        ))}
                    </View>
                )}

                                {/* Physical Activity Plan */}
                        <View style={styles.card}>
                            <Text style={styles.cardHeader}>
                                <MaterialCommunityIcons name="run" size={24} color="#4CAF50" style={styles.activityIcon} />
                                Physical Activity Plan
                            </Text>
                            
                            {/* Preview section - always visible */}
                            {getPhysicalActivityPlan().motivation && (
                                <Text style={styles.motivationText}>{getPhysicalActivityPlan().motivation}</Text>
                            )}
                            
                            {/* Collapsible content container with max height in collapsed state */}
                            <View style={[
                                styles.collapsibleContent, 
                                !expandedActivityPlan && { maxHeight: collapsedHeight }
                            ]}>
                                {/* Gradient overlay that appears only in collapsed state */}
                                {!expandedActivityPlan && (
                                    <LinearGradient
                                        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,1)']}
                                        style={styles.fadeGradient}
                                    />
                                )}
                                
                                {/* Activity sections */}
                                {Object.entries(getPhysicalActivityPlan())
                                    .filter(([key, value]) => 
                                        key !== 'motivation' && 
                                        key !== 'nutrition' && 
                                        key !== 'medicalConsiderations' && 
                                        Array.isArray(value)
                                    )
                                    .map(([category, activities]) => (
                                        <View key={category} style={styles.activitySection}>
                                            <Text style={styles.activityCategory}>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
                                            {activities.map((activity, index) => (
                                                <View key={index} style={styles.activityItem}>
                                                    <Text style={styles.activityName}>{activity.activity}</Text>
                                                    <Text style={styles.activityDetails}>Duration: {activity.duration}</Text>
                                                    <Text style={styles.activityDetails}>Frequency: {activity.frequency}</Text>
                                                    <Text style={styles.activityDetails}>{activity.intensity || activity.focus}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    ))
                                }

                                {getPhysicalActivityPlan().nutrition && (
                                    <View style={styles.activitySection}>
                                        <Text style={styles.activityCategory}>Nutrition</Text>
                                        <Text style={styles.nutritionText}>{getPhysicalActivityPlan().nutrition}</Text>
                                    </View>
                                )}

                                {getPhysicalActivityPlan().medicalConsiderations && (
                                    <View style={styles.activitySection}>
                                        <Text style={styles.activityCategory}>Medical Considerations</Text>
                                        {getPhysicalActivityPlan().medicalConsiderations.map((consideration, index) => (
                                            <Text key={index} style={styles.considerationText}>{consideration}</Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                            
                            {/* Dropdown button at the bottom center */}
                            <TouchableOpacity 
                                onPress={() => setExpandedActivityPlan(!expandedActivityPlan)}
                                style={styles.dropdownButtonContainer}
                            >
                                <View style={styles.dropdownButton}>
                                    <Text style={styles.dropdownButtonText}>
                                        {expandedActivityPlan ? "Show Less" : "Show More"}
                                    </Text>
                                    <MaterialCommunityIcons 
                                        name={expandedActivityPlan ? "chevron-up" : "chevron-down"} 
                                        size={20} 
                                        color="#FFF" 
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                
                {/* Nutrition & Calorie Needs */}
                <View style={styles.card}>
                    <Text style={styles.cardHeader}>Nutrition & Calorie Needs</Text>
                    <Text style={styles.tdeeValue}>{calculateTDEE()} kcal</Text>
                    <Text style={styles.tdeeDescription}>Adjusted for your BMI</Text>
                    
                    <View style={{marginTop: 15}}>
                        {recommendDiet().macros.map((item, index) => (
                            <View key={index} style={styles.dietRow}>
                                <MaterialCommunityIcons name={item.icon} size={24} color="#FF9800" />
                                <Text style={styles.dietText}>{item.label}: {item.value}</Text>
                            </View>
                        ))}
                        {recommendDiet().recommendations.map((rec, index) => (
                            <Text key={index} style={styles.dietRecommendation}>💡 {rec}</Text>
                        ))}
                    </View>
                </View>
                          
                          {/* Suggested Foods for One Meal */}
                          <View style={styles.card}>
                            <View style={styles.headerRow}>
                              <Text style={styles.cardHeader}>Suggested Foods (Per Meal)</Text>
                             
                            </View>
                            
                            {getSuggestedFoods().map((food, index) => (
                              <View key={index} style={styles.foodRow}>
                                <MaterialCommunityIcons name="food" size={24} color="#4CAF50" />
                                <View style={styles.foodInfo}>
                                  <Text style={styles.foodName}>{food.food_name}</Text>
                                  <Text style={styles.foodMacros}>
                                    Calories: {food.unit_serving_energy_kcal}{'\n'}
                                    Protein: {food.unit_serving_protein_g}g{'\n'}
                                    Carbs: {food.unit_serving_carb_g}g{'\n'} 
                                    Fat: {food.unit_serving_fat_g}g{'\n'}
                                  </Text>
                                </View>
                              </View>
                            ))}

                            <TouchableOpacity 
                                onPress={() => setShowAlternativeFoods(!showAlternativeFoods)}
                                style={styles.alternativeButton}
                              >
                                <Text style={styles.alternativeButtonText}>
                                  {showAlternativeFoods ? 'Show Original' : 'Show Alternatives'}
                                </Text>
                              </TouchableOpacity>
                          </View>
                          
                        </ScrollView>
            <Modal visible={calorieCalculatorVisible} onRequestClose={() => setCalorieCalculatorVisible(false)}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalText}>Detailed breakdown will go here.</Text>
                    <TouchableOpacity onPress={() => setCalorieCalculatorVisible(false)}>
                        <Text style={styles.closeButton}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5', padding: 20 },
    scrollView: { flexGrow: 1 },
    headerText: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'left', marginTop: 25 },
    card: { backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 15, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 } },
    cardHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
    vitalsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    vitalBox: { alignItems: 'center', padding: 10, backgroundColor: '#F3F3F3', borderRadius: 20, width: '30%' },
    vitalText: { fontSize: 14, fontWeight: '600', marginTop: 5 },
    tdeeValue: { fontSize: 22, fontWeight: 'bold', color: '#FF9800', textAlign: 'center' },
    tdeeDescription: { fontSize: 14, color: '#757575', textAlign: 'center' },
    dietRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    dietText: { fontSize: 16, marginLeft: 10, fontWeight: '600' },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    modalText: { fontSize: 18, marginBottom: 20 },
    closeButton: { fontSize: 18, color: 'blue' },
    alertBox: { padding: 15, borderRadius: 10, marginBottom: 10 },
    alerthigh: { backgroundColor: '#FF5252' },
    alertmedium: { backgroundColor: '#FFA726' },
    alertlow: { backgroundColor: '#4CAF50' },
    alertHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    alertMessage: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    alertRecommendation: { color: '#FFF', fontSize: 14, marginLeft: 34 },
    alertIcon: { marginRight: 8 },
    activityIcon: { marginRight: 8 },
    activitySection: { marginBottom: 15 },
    activityCategory: { fontSize: 18, fontWeight: '600', color: '#4CAF50', marginBottom: 10 },
    activityItem: { backgroundColor: '#F5F5F5', padding: 12, borderRadius: 8, marginBottom: 8 },
    activityName: { fontSize: 16, fontWeight: '600', marginBottom: 5 },
    activityDetails: { fontSize: 14, color: '#666', marginLeft: 10 },
    bmiBox: { padding: 15, borderRadius: 10, alignItems: 'center' },
    bmiUnderweight: { backgroundColor: '#FFF3E0' },
    bmiNormal: { backgroundColor: '#E8F5E9' },
    bmiOverweight: { backgroundColor: '#FFE0B2' },
    bmiObese: { backgroundColor: '#FFEBEE' },
    bmiValue: { fontSize: 24, fontWeight: 'bold'},
    bmiCategory: { fontSize: 18, marginTop: 5 },
    activityStatusContainer: { marginTop: 10 },
    activityMetric: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    activityMetricText: { marginLeft: 10, fontSize: 16 },
    motivationText: { fontSize: 16, color: '#FF9800', fontStyle: 'italic', marginBottom: 15, textAlign: 'center' },
    dietRecommendation: { fontSize: 14, color: '#666', marginTop: 10, fontStyle: 'italic' },
    foodRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },  
    foodInfo: { marginLeft: 10 },  
    foodName: { fontSize: 18, fontWeight: 'bold' },  
    foodMacros: { fontSize: 13, color: '#666' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    alternativeButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginLeft: 0,
        marginTop : 10
    },
    alternativeButtonText: { 
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600'
    },
    headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10 
    },
    collapsibleContent: {
        position: 'relative',
        overflow: 'hidden',
    },
    fadeGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        zIndex: 1,
    },
    dropdownButtonContainer: {
        alignItems: 'center',
        marginTop: 10,
        zIndex: 2,
    },
    dropdownButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dropdownButtonText: {
        color: '#FFF',
        marginRight: 5,
        fontWeight: '600',
    },
});
