import {

  useEffect,

  useState,
} from 'react';



import {

  ActivityIndicator,

  Alert,

  Modal,

  Platform,

  Pressable,

  ScrollView,

  StyleSheet,

  Text,

  TextInput,

  View,

} from 'react-native';



import {

  Ionicons,

} from '@expo/vector-icons';



import {

  useSafeAreaInsets,

} from 'react-native-safe-area-context';



import type {

  HomeownerScreenProps,

} from '../../navigation/homeownerTypes';



import {

  deleteHomeownerAppliance,

  getHomeownerApplianceById,

  updateHomeownerAppliance,

} from '../../services/homeownerApplianceService';



import type {

  HomeownerAppliance,

} from '../../types/homeownerAppliance';



const COLORS = {

  background: '#F4F8FA',

  white: '#FFFFFF',

  teal: '#087F80',

  cyan: '#0EA5C6',

  heading: '#103851',

  secondary: '#58717F',

  border: '#DEE8ED',

  preview: '#F1F9F9',

  illustrationLine: '#CEDCE3',

  danger: '#AC3546',

  dangerBackground: '#FFF5F6',

};



const MONTHS = [

  'January',

  'February',

  'March',

  'April',

  'May',

  'June',

  'July',

  'August',

  'September',

  'October',

  'November',

  'December',

];



const WEEK_DAYS = [

  'Sun',

  'Mon',

  'Tue',

  'Wed',

  'Thu',

  'Fri',

  'Sat',

];



export default function ApplianceDetailsScreen({

  route,

  navigation,

}: HomeownerScreenProps<'ApplianceDetails'>) {

  const insets =

    useSafeAreaInsets();



  const {

    applianceId,

  } = route.params;



  const [

    appliance,

    setAppliance,

  ] =

    useState<HomeownerAppliance | null>(

      null,

    );



  const [

    loading,

    setLoading,

  ] = useState(true);



  const [

    editing,

    setEditing,

  ] = useState(false);



  const [

    saving,

    setSaving,

  ] = useState(false);



  const [

    name,

    setName,

  ] = useState('');



  const [

    brand,

    setBrand,

  ] = useState('');



  const [

    model,

    setModel,

  ] = useState('');



  const [

    serialNumber,

    setSerialNumber,

  ] = useState('');



  const [

    purchaseDate,

    setPurchaseDate,

  ] = useState('');



  const [

    warrantyExpiryDate,

    setWarrantyExpiryDate,

  ] = useState('');



  const loadAppliance =

    async () => {

      try {

        setLoading(true);



        const data =

          await getHomeownerApplianceById(

            applianceId,

          );



        setAppliance(

          data,

        );



        setName(

          data.name,

        );



        setBrand(

          data.brand,

        );



        setModel(

          data.model,

        );



        setSerialNumber(

          data.serialNumber,

        );



        setPurchaseDate(

          data.purchaseDate,

        );



        setWarrantyExpiryDate(

          data.warrantyExpiryDate,

        );

      } catch (

        error

      ) {

        const message =

          error instanceof Error

            ? error.message

            : 'Unable to load appliance.';



        if (

          Platform.OS === 'web'

        ) {

          window.alert(

            message,

          );



          navigation.goBack();



          return;

        }



        Alert.alert(

          'Unable to Load',

          message,

          [

            {

              text: 'OK',

              onPress: () =>

                navigation.goBack(),

            },

          ],

        );

      } finally {

        setLoading(

          false,

        );

      }

    };



  useEffect(

    () => {

      void loadAppliance();

    },

    [applianceId],

  );



  const handleSave =

    async () => {

      if (!appliance) {

        return;

      }



      if (

        !name.trim() ||

        !brand.trim() ||

        !model.trim()

      ) {

        const message =

          'Name, brand and model are required.';



        if (

          Platform.OS === 'web'

        ) {

          window.alert(

            message,

          );



          return;

        }



        Alert.alert(

          'Missing Details',

          message,

        );



        return;

      }



      try {

        setSaving(true);



        await updateHomeownerAppliance(

          applianceId,

          {

            name:

              name.trim(),



            brand:

              brand.trim(),



            model:

              model.trim(),



            serialNumber:

              serialNumber.trim(),



            purchaseDate,



            warrantyExpiryDate,

          },

        );



        setEditing(

          false,

        );



        await loadAppliance();



        if (

          Platform.OS === 'web'

        ) {

          window.alert(

            'Appliance details updated successfully!',

          );



          return;

        }



        Alert.alert(

          'Updated',

          'Appliance details were updated successfully.',

        );

      } catch (

        error

      ) {

        const message =

          error instanceof Error

            ? error.message

            : 'Unable to update appliance.';



        if (

          Platform.OS === 'web'

        ) {

          window.alert(

            message,

          );



          return;

        }



        Alert.alert(

          'Update Failed',

          message,

        );

      } finally {

        setSaving(

          false,

        );

      }

    };



  const handleDelete =

    () => {

      const deleteAppliance =

        async () => {

          try {

            await deleteHomeownerAppliance(

              applianceId,

            );



            navigation.replace(

              'MyAppliances',

            );

          } catch (

            error

          ) {

            const message =

              error instanceof Error

                ? error.message

                : 'Unable to delete appliance.';



            if (

              Platform.OS === 'web'

            ) {

              window.alert(

                message,

              );



              return;

            }



            Alert.alert(

              'Delete Failed',

              message,

            );

          }

        };



      // Expo Web

      if (

        Platform.OS === 'web'

      ) {

        const confirmed =

          window.confirm(

            'Are you sure you want to delete this appliance?',

          );



        if (

          confirmed

        ) {

          void deleteAppliance();

        }



        return;

      }



      // Android / iOS

      Alert.alert(

        'Delete Appliance',

        'Are you sure you want to delete this appliance?',

        [

          {

            text: 'Cancel',

            style: 'cancel',

          },



          {

            text: 'Delete',

            style:

              'destructive',



            onPress: () => {

              void deleteAppliance();

            },

          },

        ],

      );

    };



  if (

    loading

  ) {

    return (

      <View

        style={

          styles.loading

        }

      >

        <ActivityIndicator

          size="large"

          color={

            COLORS.teal

          }

        />



        <Text

          style={

            styles.loadingText

          }

        >

          Loading appliance...

        </Text>

      </View>

    );

  }



  if (

    !appliance

  ) {

    return null;

  }



  return (

    <View

      style={

        styles.container

      }

    >

      <ScrollView

        showsVerticalScrollIndicator={

          false

        }

        contentContainerStyle={[

          styles.content,



          {

            paddingTop:

              insets.top +

              18,



            paddingBottom:

              insets.bottom +

              35,

          },

        ]}

      >

        {/* Header */}

        <View

          style={

            styles.header

          }

        >

          <Pressable

            style={

              styles.iconButton

            }

            onPress={() =>

              navigation.goBack()

            }

          >

            <Ionicons

              name="arrow-back"

              size={22}

              color={

                COLORS.heading

              }

            />

          </Pressable>



          <View

            style={

              styles.headerText

            }

          >

            <Text

              style={

                styles.title

              }

            >

              Appliance Details

            </Text>



            <Text

              style={

                styles.subtitle

              }

            >

              View and manage

              appliance information

            </Text>

          </View>



          <Pressable

            style={

              styles.iconButton

            }

            onPress={() =>

              setEditing(

                (

                  current,

                ) =>

                  !current,

              )

            }

          >

            <Ionicons

              name={

                editing

                  ? 'close-outline'

                  : 'create-outline'

              }

              size={22}

              color={

                COLORS.teal

              }

            />

          </Pressable>

        </View>



        {/* Appliance Hero */}

        <View

          style={

            styles.heroCard

          }

        >

          <View

            style={

              styles.heroIcon

            }

          >

            <Ionicons

              name="cube-outline"

              size={40}

              color={

                COLORS.cyan

              }

            />

          </View>



          <Text

            style={

              styles.applianceName

            }

          >

            {

              appliance.name

            }

          </Text>



          <View

            style={

              styles.categoryBadge

            }

          >

            <Text

              style={

                styles.categoryText

              }

            >

              {

                appliance.category

              }

            </Text>

          </View>

        </View>



        {/* Details */}

        <View

          style={

            styles.detailsCard

          }

        >

          <DetailField

            label="Appliance Name"

            value={name}

            editing={

              editing

            }

            onChangeText={

              setName

            }

          />



          <DetailField

            label="Brand"

            value={brand}

            editing={

              editing

            }

            onChangeText={

              setBrand

            }

          />



          <DetailField

            label="Model"

            value={model}

            editing={

              editing

            }

            onChangeText={

              setModel

            }

          />



          <DetailField

            label="Serial Number"

            value={

              serialNumber

            }

            editing={

              editing

            }

            onChangeText={

              setSerialNumber

            }

          />



          {/* Purchase Date Calendar */}

          <DateDetailField

            label="Purchase Date"

            value={

              purchaseDate

            }

            editing={

              editing

            }

            onChange={

              setPurchaseDate

            }

          />



          {/* Warranty Expiry Calendar */}

          <DateDetailField

            label="Warranty Expiry"

            value={

              warrantyExpiryDate

            }

            editing={

              editing

            }

            onChange={

              setWarrantyExpiryDate

            }

          />



          {editing && (

            <Pressable

              disabled={

                saving

              }

              style={[

                styles.saveButton,



                saving && {

                  opacity:

                    0.65,

                },

              ]}

              onPress={() =>

                void handleSave()

              }

            >

              {saving ? (

                <ActivityIndicator

                  color={

                    COLORS.white

                  }

                />

              ) : (

                <>

                  <Ionicons

                    name="checkmark"

                    size={21}

                    color={

                      COLORS.white

                    }

                  />



                  <Text

                    style={

                      styles.saveButtonText

                    }

                  >

                    Save Changes

                  </Text>

                </>

              )}

            </Pressable>

          )}



          {!editing && (

            <Pressable

              style={

                styles.warrantyButton

              }

              onPress={() => {
                // Warranty navigation will be connected
                // by the member responsible for that module.
              }}

            >

              <Ionicons

                name="shield-checkmark-outline"

                size={20}

                color={

                  COLORS.teal

                }

              />



              <Text

                style={

                  styles.warrantyButtonText

                }

              >

                View Warranty

              </Text>



              <Ionicons

                name="chevron-forward"

                size={18}

                color={

                  COLORS.teal

                }

                style={{

                  marginLeft:

                    'auto',

                }}

              />

            </Pressable>

          )}


          <Pressable

            style={

              styles.deleteButton

            }

            onPress={

              handleDelete

            }

          >

            <Ionicons

              name="trash-outline"

              size={20}

              color={

                COLORS.danger

              }

            />



            <Text

              style={

                styles.deleteButtonText

              }

            >

              Delete Appliance

            </Text>

          </Pressable>

        </View>

      </ScrollView>



    </View>

  );

}



/* =========================

   NORMAL DETAIL FIELD

========================= */



type DetailFieldProps = {

  label: string;



  value: string;



  editing: boolean;



  onChangeText:

    (

      value: string,

    ) => void;

};



function DetailField({

  label,

  value,

  editing,

  onChangeText,

}: DetailFieldProps) {

  return (

    <View

      style={

        styles.fieldGroup

      }

    >

      <Text

        style={

          styles.label

        }

      >

        {label}

      </Text>



      {editing ? (

        <TextInput

          value={value}

          onChangeText={

            onChangeText

          }

          style={

            styles.input

          }

        />

      ) : (

        <View

          style={

            styles.readOnlyField

          }

        >

          <Text

            style={

              styles.readOnlyText

            }

          >

            {value ||

              'Not provided'}

          </Text>

        </View>

      )}

    </View>

  );

}



/* =========================

   DATE DETAIL FIELD

========================= */



type DateDetailFieldProps = {

  label: string;



  value: string;



  editing: boolean;



  onChange:

    (

      value: string,

    ) => void;

};



function formatDate(

  year: number,

  month: number,

  day: number,

) {

  return `${year}-${String(

    month + 1,

  ).padStart(

    2,

    '0',

  )}-${String(

    day,

  ).padStart(

    2,

    '0',

  )}`;

}



function getInitialMonth(

  value: string,

) {

  const parts =

    value.split('-');



  if (

    parts.length === 3

  ) {

    const year =

      Number(

        parts[0],

      );



    const month =

      Number(

        parts[1],

      );



    if (

      !Number.isNaN(

        year,

      ) &&

      !Number.isNaN(

        month,

      )

    ) {

      return new Date(

        year,

        month - 1,

        1,

      );

    }

  }



  const today =

    new Date();



  return new Date(

    today.getFullYear(),

    today.getMonth(),

    1,

  );

}



function DateDetailField({

  label,

  value,

  editing,

  onChange,

}: DateDetailFieldProps) {

  const [

    visible,

    setVisible,

  ] = useState(false);



  const [

    displayedMonth,

    setDisplayedMonth,

  ] = useState(

    getInitialMonth(

      value,

    ),

  );



  const year =

    displayedMonth.getFullYear();



  const month =

    displayedMonth.getMonth();



  const firstDay =

    new Date(

      year,

      month,

      1,

    ).getDay();



  const daysInMonth =

    new Date(

      year,

      month + 1,

      0,

    ).getDate();



  const calendarCells:

    Array<number | null> =

    [];



  for (

    let index = 0;

    index < firstDay;

    index += 1

  ) {

    calendarCells.push(

      null,

    );

  }



  for (

    let day = 1;

    day <= daysInMonth;

    day += 1

  ) {

    calendarCells.push(

      day,

    );

  }



  while (

    calendarCells.length %

      7 !==

    0

  ) {

    calendarCells.push(

      null,

    );

  }



  const openCalendar =

    () => {

      setDisplayedMonth(

        getInitialMonth(

          value,

        ),

      );



      setVisible(

        true,

      );

    };



  const previousMonth =

    () => {

      setDisplayedMonth(

        new Date(

          year,

          month - 1,

          1,

        ),

      );

    };



  const nextMonth =

    () => {

      setDisplayedMonth(

        new Date(

          year,

          month + 1,

          1,

        ),

      );

    };



  const selectDate =

    (

      day: number,

    ) => {

      onChange(

        formatDate(

          year,

          month,

          day,

        ),

      );



      setVisible(

        false,

      );

    };



  const selectToday =

    () => {

      const today =

        new Date();



      onChange(

        formatDate(

          today.getFullYear(),

          today.getMonth(),

          today.getDate(),

        ),

      );



      setVisible(

        false,

      );

    };



  return (

    <View

      style={

        styles.fieldGroup

      }

    >

      <Text

        style={

          styles.label

        }

      >

        {label}

      </Text>



      {!editing ? (

        <View

          style={

            styles.readOnlyField

          }

        >

          <Text

            style={

              styles.readOnlyText

            }

          >

            {value ||

              'Not provided'}

          </Text>

        </View>

      ) : (

        <Pressable

          style={

            styles.dateInput

          }

          onPress={

            openCalendar

          }

        >

          <Text

            style={[

              styles.dateInputText,



              !value &&

                styles.datePlaceholder,

            ]}

          >

            {value ||

              'Select date'}

          </Text>



          <Ionicons

            name="calendar-outline"

            size={21}

            color={

              COLORS.teal

            }

          />

        </Pressable>

      )}



      <Modal

        visible={

          visible

        }

        transparent

        animationType="fade"

        onRequestClose={() =>

          setVisible(

            false,

          )

        }

      >

        <View

          style={

            styles.modalOverlay

          }

        >

          <View

            style={

              styles.calendarCard

            }

          >

            {/* Month Header */}

            <View

              style={

                styles.calendarHeader

              }

            >

              <Pressable

                style={

                  styles.monthButton

                }

                onPress={

                  previousMonth

                }

              >

                <Ionicons

                  name="chevron-back"

                  size={22}

                  color={

                    COLORS.heading

                  }

                />

              </Pressable>



              <Text

                style={

                  styles.monthTitle

                }

              >

                {

                  MONTHS[

                    month

                  ]

                }{' '}

                {year}

              </Text>



              <Pressable

                style={

                  styles.monthButton

                }

                onPress={

                  nextMonth

                }

              >

                <Ionicons

                  name="chevron-forward"

                  size={22}

                  color={

                    COLORS.heading

                  }

                />

              </Pressable>

            </View>



            {/* Week Days */}

            <View

              style={

                styles.weekRow

              }

            >

              {WEEK_DAYS.map(

                (

                  day,

                ) => (

                  <Text

                    key={

                      day

                    }

                    style={

                      styles.weekDayText

                    }

                  >

                    {day}

                  </Text>

                ),

              )}

            </View>



            {/* Days */}

            <View

              style={

                styles.daysGrid

              }

            >

              {calendarCells.map(

                (

                  day,

                  index,

                ) => {

                  if (

                    day ===

                    null

                  ) {

                    return (

                      <View

                        key={`empty-${index}`}

                        style={

                          styles.dayCell

                        }

                      />

                    );

                  }



                  const dateValue =

                    formatDate(

                      year,

                      month,

                      day,

                    );



                  const selected =

                    value ===

                    dateValue;



                  return (

                    <Pressable

                      key={

                        dateValue

                      }

                      style={[

                        styles.dayCell,



                        selected &&

                          styles.selectedDay,

                      ]}

                      onPress={() =>

                        selectDate(

                          day,

                        )

                      }

                    >

                      <Text

                        style={[

                          styles.dayText,



                          selected &&

                            styles.selectedDayText,

                        ]}

                      >

                        {

                          day

                        }

                      </Text>

                    </Pressable>

                  );

                },

              )}

            </View>



            {/* Actions */}

            <View

              style={

                styles.calendarActions

              }

            >

              <Pressable

                style={

                  styles.calendarCancelButton

                }

                onPress={() =>

                  setVisible(

                    false,

                  )

                }

              >

                <Text

                  style={

                    styles.calendarCancelText

                  }

                >

                  Cancel

                </Text>

              </Pressable>



              <Pressable

                style={

                  styles.todayButton

                }

                onPress={

                  selectToday

                }

              >

                <Ionicons

                  name="calendar"

                  size={17}

                  color={

                    COLORS.white

                  }

                />



                <Text

                  style={

                    styles.todayButtonText

                  }

                >

                  Today

                </Text>

              </Pressable>

            </View>

          </View>

        </View>

      </Modal>

    </View>

  );

}



/* =========================

   STYLES

========================= */



const styles =

  StyleSheet.create({

    container: {

      flex: 1,



      backgroundColor:

        COLORS.background,

    },



    loading: {

      flex: 1,



      backgroundColor:

        COLORS.background,



      alignItems:

        'center',



      justifyContent:

        'center',



      gap: 10,

    },



    loadingText: {

      color:

        COLORS.secondary,

    },



    content: {

      width: '100%',



      maxWidth: 500,



      alignSelf:

        'center',



      paddingHorizontal:

        20,

    },



    header: {

      flexDirection:

        'row',



      alignItems:

        'center',



      gap: 12,



      marginBottom:

        20,

    },



    headerText: {

      flex: 1,

    },



    iconButton: {

      width: 43,



      height: 43,



      borderRadius:

        13,



      backgroundColor:

        COLORS.white,



      borderWidth: 1,



      borderColor:

        COLORS.border,



      alignItems:

        'center',



      justifyContent:

        'center',

    },



    title: {

      fontSize: 23,



      fontWeight:

        '800',



      color:

        COLORS.heading,

    },



    subtitle: {

      marginTop: 3,



      fontSize: 12,



      color:

        COLORS.secondary,

    },



    heroCard: {

      backgroundColor:

        COLORS.preview,



      borderWidth: 1,



      borderColor:

        COLORS.border,



      borderRadius:

        20,



      padding: 22,



      alignItems:

        'center',

    },



    heroIcon: {

      width: 75,



      height: 75,



      borderRadius:

        22,



      backgroundColor:

        COLORS.white,



      borderWidth: 1,



      borderColor:

        COLORS.illustrationLine,



      alignItems:

        'center',



      justifyContent:

        'center',

    },



    applianceName: {

      marginTop: 12,



      fontSize: 20,



      fontWeight:

        '800',



      color:

        COLORS.heading,

    },



    categoryBadge: {

      marginTop: 8,



      paddingHorizontal:

        12,



      paddingVertical:

        5,



      borderRadius:

        8,



      backgroundColor:

        COLORS.white,

    },



    categoryText: {

      color:

        COLORS.teal,



      fontSize: 11,



      fontWeight:

        '700',

    },



    detailsCard: {

      marginTop: 16,



      backgroundColor:

        COLORS.white,



      borderWidth: 1,



      borderColor:

        COLORS.border,



      borderRadius:

        20,



      padding: 19,



      gap: 16,

    },



    fieldGroup: {

      gap: 6,

    },



    label: {

      fontSize: 12,



      fontWeight:

        '700',



      color:

        COLORS.secondary,

    },



    readOnlyField: {

      minHeight: 48,



      borderRadius:

        11,



      backgroundColor:

        COLORS.preview,



      borderWidth: 1,



      borderColor:

        COLORS.border,



      justifyContent:

        'center',



      paddingHorizontal:

        13,

    },



    readOnlyText: {

      fontSize: 14,



      color:

        COLORS.heading,

    },



    input: {

      minHeight: 48,



      borderRadius:

        11,



      backgroundColor:

        COLORS.white,



      borderWidth: 1,



      borderColor:

        COLORS.teal,



      color:

        COLORS.heading,



      paddingHorizontal:

        13,



      fontSize: 14,

    },



    /* Date Input */



    dateInput: {

      minHeight: 48,



      borderRadius:

        11,



      backgroundColor:

        COLORS.white,



      borderWidth: 1,



      borderColor:

        COLORS.teal,



      paddingHorizontal:

        13,



      flexDirection:

        'row',



      alignItems:

        'center',



      justifyContent:

        'space-between',

    },



    dateInputText: {

      color:

        COLORS.heading,



      fontSize: 14,

    },



    datePlaceholder: {

      color:

        COLORS.secondary,

    },



    /* Calendar */



    modalOverlay: {

      flex: 1,



      backgroundColor:

        'rgba(16, 56, 81, 0.35)',



      justifyContent:

        'center',



      alignItems:

        'center',



      padding: 20,

    },



    calendarCard: {

      width: '100%',



      maxWidth: 390,



      backgroundColor:

        COLORS.white,



      borderRadius:

        20,



      borderWidth: 1,



      borderColor:

        COLORS.border,



      padding: 18,

    },



    calendarHeader: {

      flexDirection:

        'row',



      justifyContent:

        'space-between',



      alignItems:

        'center',



      marginBottom:

        17,

    },



    monthButton: {

      width: 40,



      height: 40,



      borderRadius:

        12,



      backgroundColor:

        COLORS.preview,



      alignItems:

        'center',



      justifyContent:

        'center',

    },



    monthTitle: {

      color:

        COLORS.heading,



      fontSize: 16,



      fontWeight:

        '800',

    },



    weekRow: {

      flexDirection:

        'row',



      marginBottom: 6,

    },



    weekDayText: {

      width:

        '14.285%',



      textAlign:

        'center',



      color:

        COLORS.secondary,



      fontSize: 10,



      fontWeight:

        '700',

    },



    daysGrid: {

      flexDirection:

        'row',



      flexWrap:

        'wrap',

    },



    dayCell: {

      width:

        '14.285%',



      aspectRatio: 1,



      alignItems:

        'center',



      justifyContent:

        'center',



      borderRadius:

        50,

    },



    dayText: {

      fontSize: 13,



      fontWeight:

        '600',



      color:

        COLORS.heading,

    },



    selectedDay: {

      backgroundColor:

        COLORS.teal,

    },



    selectedDayText: {

      color:

        COLORS.white,



      fontWeight:

        '800',

    },



    calendarActions: {

      marginTop: 16,



      borderTopWidth: 1,



      borderTopColor:

        COLORS.border,



      paddingTop: 14,



      flexDirection:

        'row',



      justifyContent:

        'flex-end',



      gap: 9,

    },



    calendarCancelButton: {

      minHeight: 42,



      paddingHorizontal:

        16,



      borderRadius:

        10,



      borderWidth: 1,



      borderColor:

        COLORS.border,



      backgroundColor:

        COLORS.white,



      justifyContent:

        'center',



      alignItems:

        'center',

    },



    calendarCancelText: {

      color:

        COLORS.secondary,



      fontSize: 12,



      fontWeight:

        '700',

    },



    todayButton: {

      minHeight: 42,



      paddingHorizontal:

        16,



      borderRadius:

        10,



      backgroundColor:

        COLORS.teal,



      flexDirection:

        'row',



      alignItems:

        'center',



      justifyContent:

        'center',



      gap: 6,

    },



    todayButtonText: {

      color:

        COLORS.white,



      fontSize: 12,



      fontWeight:

        '700',

    },



    saveButton: {

      minHeight: 52,



      borderRadius:

        13,



      backgroundColor:

        COLORS.teal,



      flexDirection:

        'row',



      gap: 8,



      alignItems:

        'center',



      justifyContent:

        'center',

    },



    saveButtonText: {

      color:

        COLORS.white,



      fontSize: 14,



      fontWeight:

        '700',

    },



    warrantyButton: {

      minHeight: 50,

      borderRadius:

        13,

      borderWidth: 1,

      borderColor:

        COLORS.teal,

      backgroundColor:

        COLORS.preview,

      paddingHorizontal:

        15,

      flexDirection:

        'row',

      gap: 8,

      alignItems:

        'center',

      justifyContent:

        'center',

    },



    warrantyButtonText: {

      color:

        COLORS.teal,

      fontSize: 14,

      fontWeight:

        '700',

    },



    deleteButton: {

      minHeight: 50,



      borderRadius:

        13,



      borderWidth: 1,



      borderColor:

        '#F1D3D7',



      backgroundColor:

        COLORS.dangerBackground,



      flexDirection:

        'row',



      gap: 8,



      alignItems:

        'center',



      justifyContent:

        'center',

    },



    deleteButtonText: {

      color:

        COLORS.danger,



      fontSize: 14,



      fontWeight:

        '700',

    },

  });