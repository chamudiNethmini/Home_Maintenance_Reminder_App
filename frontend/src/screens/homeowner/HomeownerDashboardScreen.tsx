import {

  useCallback,

  useState,

} from 'react';



import { Ionicons } from '@expo/vector-icons';



import {

  ActivityIndicator,

  Pressable,

  ScrollView,

  StyleSheet,

  Text,

  View,

} from 'react-native';



import {

  useFocusEffect,

} from '@react-navigation/native';



import {

  useSafeAreaInsets,

} from 'react-native-safe-area-context';



import type {

  HomeownerScreenProps,

} from '../../navigation/homeownerTypes';



import type {

  MaintenanceSchedule,

} from '../../types/maintenance';



import {

  getMaintenanceSchedules,

} from '../../services/maintenanceService';



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

  dangerBorder: '#F1D3D7',

};



function getTodayString() {

  const today = new Date();



  const year =

    today.getFullYear();



  const month =

    String(

      today.getMonth() + 1,

    ).padStart(

      2,

      '0',

    );



  const day =

    String(

      today.getDate(),

    ).padStart(

      2,

      '0',

    );



  return `${year}-${month}-${day}`;

}



function getMaintenanceIcon(

  schedule: MaintenanceSchedule,

) {

  const text =

    `${schedule.applianceName} ${schedule.maintenanceType}`

      .toLowerCase();



  if (

    text.includes('air') ||

    text.includes('ac')

  ) {

    return 'snow-outline' as const;

  }



  if (

    text.includes('washing') ||

    text.includes('water')

  ) {

    return 'water-outline' as const;

  }



  if (

    text.includes('clean')

  ) {

    return 'sparkles-outline' as const;

  }



  return 'build-outline' as const;

}



export default function HomeownerDashboardScreen({

  navigation,

}: HomeownerScreenProps<'Dashboard'>) {

  const insets =

    useSafeAreaInsets();



  const [

    schedules,

    setSchedules,

  ] =

    useState<MaintenanceSchedule[]>(

      [],

    );



  const [

    loadingMaintenance,

    setLoadingMaintenance,

  ] = useState(true);



  const loadMaintenance =

    useCallback(

      async () => {

        try {

          setLoadingMaintenance(

            true,

          );



          const data =

            await getMaintenanceSchedules();



          setSchedules(

            data,

          );

        } catch (error) {

          console.error(

            'Unable to load dashboard maintenance:',

            error,

          );

        } finally {

          setLoadingMaintenance(

            false,

          );

        }

      },

      [],

    );



  useFocusEffect(

    useCallback(

      () => {

        void loadMaintenance();

      },

      [loadMaintenance],

    ),

  );



  const today =

    getTodayString();



  const overdue =

    schedules.filter(

      (schedule) =>

        schedule.status ===

          'upcoming' &&

        schedule.scheduledDate <

          today,

    );



  const upcoming =

    schedules.filter(

      (schedule) =>

        schedule.status ===

          'upcoming' &&

        schedule.scheduledDate >=

          today,

    );



  const dashboardSchedules = [

    ...overdue,

    ...upcoming,

  ].slice(

    0,

    2,

  );



  const pendingCount =

    overdue.length +

    upcoming.length;



  return (

    <View style={styles.container}>

      <ScrollView

        showsVerticalScrollIndicator={

          false

        }

        contentContainerStyle={[

          styles.scrollContent,

          {

            paddingTop:

              insets.top +

              18,

          },

        ]}

      >

        {/* Header */}

        <View style={styles.header}>

          <View

            style={

              styles.headerText

            }

          >

            <Text

              style={

                styles.smallHeading

              }

            >

              HOME MAINTENANCE

            </Text>



            <Text

              style={

                styles.greeting

              }

            >

              Good Morning, Chamudi!

            </Text>



            <Text

              style={

                styles.subtitle

              }

            >

              Here's what's happening

              with your home today.

            </Text>

          </View>



          <View

            style={

              styles.headerActions

            }

          >

            <Pressable

              style={

                styles.iconButton

              }

              onPress={() =>

                navigation.navigate(

                  'ReminderSettings',

                  {},

                )

              }

            >

              <Ionicons

                name="notifications-outline"

                size={23}

                color={

                  COLORS.heading

                }

              />

            </Pressable>



            <Pressable

              style={

                styles.profileButton

              }

              onPress={() =>

                navigation.navigate(

                  'Profile',

                )

              }

            >

              <Ionicons

                name="person-outline"

                size={22}

                color={

                  COLORS.white

                }

              />

            </Pressable>

          </View>

        </View>



        {/* Hero */}

        <View

          style={

            styles.heroCard

          }

        >

          <View

            style={

              styles.heroContent

            }

          >

            <Text

              style={

                styles.heroTitle

              }

            >

              Keep Your Home

              {'\n'}

              Running Smoothly

            </Text>



            <Text

              style={

                styles.heroDescription

              }

            >

              Stay ahead of appliance

              maintenance and keep

              everything in perfect

              condition.

            </Text>

          </View>



          <View

            style={

              styles.heroIllustration

            }

          >

            <View

              style={

                styles.homeCircle

              }

            >

              <Ionicons

                name="home-outline"

                size={45}

                color={

                  COLORS.cyan

                }

              />

            </View>

          </View>

        </View>



        {/* Maintenance Alert */}

        <View

          style={[

            styles.alertCard,



            overdue.length >

              0 &&

              styles.overdueAlertCard,

          ]}

        >

          <View

            style={[

              styles.alertIconContainer,



              overdue.length >

                0 &&

                styles.overdueAlertIcon,

            ]}

          >

            <Ionicons

              name={

                overdue.length >

                0

                  ? 'warning-outline'

                  : 'time-outline'

              }

              size={25}

              color={

                overdue.length >

                0

                  ? COLORS.danger

                  : COLORS.cyan

              }

            />

          </View>



          <View

            style={

              styles.alertContent

            }

          >

            <Text

              style={

                styles.alertTitle

              }

            >

              {overdue.length >

              0

                ? 'Overdue Maintenance'

                : 'Maintenance Reminder'}

            </Text>



            <Text

              style={

                styles.alertText

              }

            >

              {overdue.length >

              0

                ? `You have ${overdue.length} overdue maintenance task${overdue.length === 1 ? '' : 's'}.`

                : pendingCount >

                    0

                  ? `You have ${pendingCount} upcoming maintenance task${pendingCount === 1 ? '' : 's'}.`

                  : 'You have no pending maintenance tasks.'}

            </Text>

          </View>



          <Pressable

            style={

              styles.reviewButton

            }

            onPress={() =>

              navigation.navigate(

                'MaintenanceCalendar',

              )

            }

          >

            <Text

              style={

                styles.reviewButtonText

              }

            >

              Review

            </Text>

          </Pressable>

        </View>



        {/* Upcoming Maintenance */}

        <View

          style={

            styles.sectionHeader

          }

        >

          <Text

            style={

              styles.sectionTitle

            }

          >

            Upcoming Maintenance

          </Text>



          <Pressable

            onPress={() =>

              navigation.navigate(

                'MaintenanceCalendar',

              )

            }

          >

            <Text

              style={

                styles.seeAll

              }

            >

              See All

            </Text>

          </Pressable>

        </View>



        {loadingMaintenance ? (

          <View

            style={

              styles.loadingCard

            }

          >

            <ActivityIndicator

              color={

                COLORS.teal

              }

            />



            <Text

              style={

                styles.loadingText

              }

            >

              Loading maintenance...

            </Text>

          </View>

        ) : dashboardSchedules.length ===

          0 ? (

          <View

            style={

              styles.emptyMaintenanceCard

            }

          >

            <View

              style={

                styles.emptyIcon

              }

            >

              <Ionicons

                name="calendar-outline"

                size={30}

                color={

                  COLORS.cyan

                }

              />

            </View>



            <View

              style={

                styles.emptyContent

              }

            >

              <Text

                style={

                  styles.emptyTitle

                }

              >

                No maintenance scheduled

              </Text>



              <Text

                style={

                  styles.emptyDescription

                }

              >

                Add a maintenance schedule

                for one of your appliances.

              </Text>

            </View>

          </View>

        ) : (

          dashboardSchedules.map(

            (

              schedule,

            ) => {

              const isOverdue =

                schedule.status ===

                  'upcoming' &&

                schedule.scheduledDate <

                  today;



              return (

                <Pressable

                  key={

                    schedule.id

                  }

                  style={[

                    styles.maintenanceCard,



                    isOverdue &&

                      styles.overdueMaintenanceCard,

                  ]}

                  onPress={() =>

                    navigation.navigate(

                      'MaintenanceCalendar',

                    )

                  }

                >

                  <View

                    style={[

                      styles.applianceIcon,



                      isOverdue &&

                        styles.overdueApplianceIcon,

                    ]}

                  >

                    <Ionicons

                      name={

                        getMaintenanceIcon(

                          schedule,

                        )

                      }

                      size={25}

                      color={

                        isOverdue

                          ? COLORS.danger

                          : COLORS.cyan

                      }

                    />

                  </View>



                  <View

                    style={

                      styles.maintenanceInformation

                    }

                  >

                    <Text

                      style={

                        styles.maintenanceTitle

                      }

                    >

                      {

                        schedule.maintenanceType

                      }

                    </Text>



                    <Text

                      style={

                        styles.maintenanceSubtitle

                      }

                    >

                      {

                        schedule.applianceName

                      }

                    </Text>



                    <Text

                      style={[

                        styles.maintenanceDate,



                        isOverdue &&

                          styles.overdueDate,

                      ]}

                    >

                      {

                        schedule.scheduledDate

                      }

                    </Text>

                  </View>



                  <View

                    style={[

                      styles.statusBadge,



                      isOverdue &&

                        styles.overdueStatusBadge,

                    ]}

                  >

                    <Text

                      style={[

                        styles.statusText,



                        isOverdue &&

                          styles.overdueStatusText,

                      ]}

                    >

                      {isOverdue

                        ? 'Overdue'

                        : 'Upcoming'}

                    </Text>

                  </View>

                </Pressable>

              );

            },

          )

        )}



        {/* Quick Actions */}

        <View

          style={

            styles.sectionHeader

          }

        >

          <Text

            style={

              styles.sectionTitle

            }

          >

            Quick Actions

          </Text>

        </View>



        <View

          style={

            styles.quickActionsGrid

          }

        >

          {/* Add Appliance */}

          <Pressable

            style={

              styles.quickActionCard

            }

            onPress={() =>

              navigation.navigate(

                'AddAppliance',

              )

            }

          >

            <View

              style={

                styles.quickActionIcon

              }

            >

              <Ionicons

                name="add-circle-outline"

                size={28}

                color={

                  COLORS.teal

                }

              />

            </View>



            <Text

              style={

                styles.quickActionTitle

              }

            >

              Add Appliance

            </Text>



            <Text

              style={

                styles.quickActionDescription

              }

            >

              Register a new appliance

            </Text>

          </Pressable>



          {/* Calendar */}

          <Pressable

            style={

              styles.quickActionCard

            }

            onPress={() =>

              navigation.navigate(

                'MaintenanceCalendar',

              )

            }

          >

            <View

              style={

                styles.quickActionIcon

              }

            >

              <Ionicons

                name="calendar-outline"

                size={27}

                color={

                  COLORS.teal

                }

              />

            </View>



            <Text

              style={

                styles.quickActionTitle

              }

            >

              Calendar

            </Text>



            <Text

              style={

                styles.quickActionDescription

              }

            >

              View maintenance plans

            </Text>

          </Pressable>



          {/* Appliances */}

          <Pressable

            style={

              styles.quickActionCard

            }

            onPress={() =>

              navigation.navigate(

                'MyAppliances',

              )

            }

          >

            <View

              style={

                styles.quickActionIcon

              }

            >

              <Ionicons

                name="apps-outline"

                size={27}

                color={

                  COLORS.teal

                }

              />

            </View>



            <Text

              style={

                styles.quickActionTitle

              }

            >

              My Appliances

            </Text>



            <Text

              style={

                styles.quickActionDescription

              }

            >

              Manage your appliances

            </Text>

          </Pressable>



          {/* Reminders */}

          <Pressable

            style={

              styles.quickActionCard

            }

            onPress={() =>

              navigation.navigate(

                'ReminderSettings',

                {},

              )

            }

          >

            <View

              style={

                styles.quickActionIcon

              }

            >

              <Ionicons

                name="notifications-outline"

                size={27}

                color={

                  COLORS.teal

                }

              />

            </View>



            <Text

              style={

                styles.quickActionTitle

              }

            >

              Reminders

            </Text>



            <Text

              style={

                styles.quickActionDescription

              }

            >

              Manage maintenance alerts

            </Text>

          </Pressable>



          {/* My Warranty */}

          <Pressable

            style={

              styles.quickActionCard

            }

  onPress={() => {
  navigation.navigate('MyWarranty');
}}

          >

            <View

              style={

                styles.quickActionIcon

              }

            >

              <Ionicons

                name="shield-checkmark-outline"

                size={27}

                color={

                  COLORS.teal

                }

              />

            </View>



            <Text

              style={

                styles.quickActionTitle

              }

            >

              My Warranty

            </Text>



            <Text

              style={

                styles.quickActionDescription

              }

            >

              View and manage warranties

            </Text>

          </Pressable>

        </View>

      </ScrollView>



      {/* Bottom Navigation */}

      <View

        style={[

          styles.bottomNavigation,

          {

            paddingBottom:

              Math.max(

                insets.bottom,

                10,

              ),

          },

        ]}

      >

        <Pressable

          style={

            styles.navigationItem

          }

        >

          <Ionicons

            name="home"

            size={22}

            color={

              COLORS.teal

            }

          />



          <Text

            style={

              styles.activeNavigationText

            }

          >

            Home

          </Text>

        </Pressable>



        <Pressable

          style={

            styles.navigationItem

          }

          onPress={() =>

            navigation.navigate(

              'MyAppliances',

            )

          }

        >

          <Ionicons

            name="apps-outline"

            size={22}

            color={

              COLORS.secondary

            }

          />



          <Text

            style={

              styles.navigationText

            }

          >

            Appliances

          </Text>

        </Pressable>



        <Pressable

          style={

            styles.navigationItem

          }

          onPress={() =>

            navigation.navigate(

              'MaintenanceCalendar',

            )

          }

        >

          <Ionicons

            name="calendar-outline"

            size={22}

            color={

              COLORS.secondary

            }

          />



          <Text

            style={

              styles.navigationText

            }

          >

            Calendar

          </Text>

        </Pressable>



        <Pressable

          style={

            styles.navigationItem

          }

          onPress={() =>

            navigation.navigate(

              'Profile',

            )

          }

        >

          <Ionicons

            name="person-outline"

            size={22}

            color={

              COLORS.secondary

            }

          />



          <Text

            style={

              styles.navigationText

            }

          >

            Profile

          </Text>

        </Pressable>

      </View>

    </View>

  );

}



const styles =

  StyleSheet.create({

    container: {

      flex: 1,

      backgroundColor:

        COLORS.background,

    },



    scrollContent: {

      width: '100%',

      maxWidth: 500,

      alignSelf:

        'center',

      paddingHorizontal:

        20,

      paddingBottom:

        105,

    },



    header: {

      flexDirection:

        'row',

      justifyContent:

        'space-between',

      alignItems:

        'flex-start',

      marginBottom:

        22,

    },



    headerText: {

      flex: 1,

      paddingRight: 10,

    },



    smallHeading: {

      fontSize: 11,

      fontWeight:

        '700',

      color:

        COLORS.teal,

      letterSpacing:

        1.2,

      marginBottom: 5,

    },



    greeting: {

      fontSize: 25,

      fontWeight:

        '800',

      color:

        COLORS.heading,

    },



    subtitle: {

      marginTop: 5,

      fontSize: 13,

      lineHeight: 19,

      color:

        COLORS.secondary,

    },



    headerActions: {

      flexDirection:

        'row',

      gap: 8,

    },



    iconButton: {

      width: 42,

      height: 42,

      borderRadius: 21,

      backgroundColor:

        COLORS.white,

      borderWidth: 1,

      borderColor:

        COLORS.border,

      justifyContent:

        'center',

      alignItems:

        'center',

    },



    profileButton: {

      width: 42,

      height: 42,

      borderRadius: 21,

      backgroundColor:

        COLORS.teal,

      justifyContent:

        'center',

      alignItems:

        'center',

    },



    heroCard: {

      minHeight: 150,

      backgroundColor:

        COLORS.preview,

      borderRadius: 20,

      borderWidth: 1,

      borderColor:

        COLORS.border,

      padding: 20,

      flexDirection:

        'row',

      alignItems:

        'center',

    },



    heroContent: {

      flex: 1,

      paddingRight: 10,

    },



    heroTitle: {

      fontSize: 21,

      lineHeight: 28,

      fontWeight:

        '800',

      color:

        COLORS.heading,

    },



    heroDescription: {

      marginTop: 9,

      fontSize: 12,

      lineHeight: 18,

      color:

        COLORS.secondary,

    },



    heroIllustration: {

      alignItems:

        'center',

      justifyContent:

        'center',

    },



    homeCircle: {

      width: 85,

      height: 85,

      borderRadius: 24,

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



    alertCard: {

      marginTop: 14,

      padding: 14,

      borderRadius: 16,

      backgroundColor:

        COLORS.white,

      borderWidth: 1,

      borderColor:

        COLORS.border,

      flexDirection:

        'row',

      alignItems:

        'center',

    },



    overdueAlertCard: {

      backgroundColor:

        COLORS.dangerBackground,

      borderColor:

        COLORS.dangerBorder,

    },



    alertIconContainer: {

      width: 43,

      height: 43,

      borderRadius: 13,

      backgroundColor:

        COLORS.preview,

      alignItems:

        'center',

      justifyContent:

        'center',

      marginRight: 11,

    },



    overdueAlertIcon: {

      backgroundColor:

        COLORS.white,

    },



    alertContent: {

      flex: 1,

    },



    alertTitle: {

      fontSize: 13,

      fontWeight:

        '700',

      color:

        COLORS.heading,

    },



    alertText: {

      fontSize: 11,

      lineHeight: 16,

      color:

        COLORS.secondary,

      marginTop: 3,

    },



    reviewButton: {

      marginLeft: 8,

      backgroundColor:

        COLORS.teal,

      paddingHorizontal:

        13,

      paddingVertical: 8,

      borderRadius: 9,

    },



    reviewButtonText: {

      color:

        COLORS.white,

      fontSize: 11,

      fontWeight:

        '700',

    },



    sectionHeader: {

      marginTop: 25,

      marginBottom:

        11,

      flexDirection:

        'row',

      justifyContent:

        'space-between',

      alignItems:

        'center',

    },



    sectionTitle: {

      fontSize: 17,

      fontWeight:

        '800',

      color:

        COLORS.heading,

    },



    seeAll: {

      fontSize: 12,

      fontWeight:

        '700',

      color:

        COLORS.teal,

    },



    loadingCard: {

      minHeight: 110,

      backgroundColor:

        COLORS.white,

      borderRadius: 15,

      borderWidth: 1,

      borderColor:

        COLORS.border,

      justifyContent:

        'center',

      alignItems:

        'center',

      gap: 8,

    },



    loadingText: {

      fontSize: 11,

      color:

        COLORS.secondary,

    },



    emptyMaintenanceCard: {

      minHeight: 100,

      backgroundColor:

        COLORS.white,

      borderRadius: 15,

      borderWidth: 1,

      borderColor:

        COLORS.border,

      padding: 15,

      flexDirection:

        'row',

      alignItems:

        'center',

    },



    emptyIcon: {

      width: 48,

      height: 48,

      borderRadius: 14,

      backgroundColor:

        COLORS.preview,

      justifyContent:

        'center',

      alignItems:

        'center',

    },



    emptyContent: {

      flex: 1,

      marginLeft: 12,

    },



    emptyTitle: {

      color:

        COLORS.heading,

      fontWeight:

        '700',

      fontSize: 13,

    },



    emptyDescription: {

      marginTop: 4,

      color:

        COLORS.secondary,

      fontSize: 11,

    },



    maintenanceCard: {

      backgroundColor:

        COLORS.white,

      borderRadius: 15,

      borderWidth: 1,

      borderColor:

        COLORS.border,

      padding: 13,

      marginBottom: 9,

      flexDirection:

        'row',

      alignItems:

        'center',

    },



    overdueMaintenanceCard: {

      borderColor:

        COLORS.dangerBorder,

      backgroundColor:

        COLORS.dangerBackground,

    },



    applianceIcon: {

      width: 45,

      height: 45,

      borderRadius: 13,

      backgroundColor:

        COLORS.preview,

      borderWidth: 1,

      borderColor:

        COLORS.illustrationLine,

      alignItems:

        'center',

      justifyContent:

        'center',

    },



    overdueApplianceIcon: {

      backgroundColor:

        COLORS.white,

      borderColor:

        COLORS.dangerBorder,

    },



    maintenanceInformation: {

      flex: 1,

      marginLeft: 11,

    },



    maintenanceTitle: {

      fontSize: 14,

      fontWeight:

        '700',

      color:

        COLORS.heading,

    },



    maintenanceSubtitle: {

      marginTop: 3,

      fontSize: 11,

      color:

        COLORS.secondary,

    },



    maintenanceDate: {

      marginTop: 4,

      fontSize: 10,

      color:

        COLORS.secondary,

    },



    overdueDate: {

      color:

        COLORS.danger,

      fontWeight:

        '700',

    },



    statusBadge: {

      paddingHorizontal:

        10,

      paddingVertical: 6,

      borderRadius: 8,

      backgroundColor:

        COLORS.preview,

      borderWidth: 1,

      borderColor:

        COLORS.border,

    },



    statusText: {

      fontSize: 10,

      fontWeight:

        '700',

      color:

        COLORS.teal,

    },



    overdueStatusBadge: {

      backgroundColor:

        COLORS.white,

      borderColor:

        COLORS.dangerBorder,

    },



    overdueStatusText: {

      color:

        COLORS.danger,

    },



    quickActionsGrid: {

      flexDirection:

        'row',

      flexWrap:

        'wrap',

      justifyContent:

        'space-between',

      rowGap: 12,

    },



    quickActionCard: {

      width: '48%',

      minHeight: 125,

      backgroundColor:

        COLORS.white,

      borderRadius: 16,

      borderWidth: 1,

      borderColor:

        COLORS.border,

      padding: 15,

      alignItems:

        'center',

      justifyContent:

        'center',

    },



    quickActionIcon: {

      width: 48,

      height: 48,

      borderRadius: 14,

      backgroundColor:

        COLORS.preview,

      borderWidth: 1,

      borderColor:

        COLORS.illustrationLine,

      alignItems:

        'center',

      justifyContent:

        'center',

      marginBottom: 9,

    },



    quickActionTitle: {

      fontSize: 13,

      fontWeight:

        '700',

      color:

        COLORS.heading,

      textAlign:

        'center',

    },



    quickActionDescription: {

      marginTop: 4,

      fontSize: 10,

      lineHeight: 14,

      color:

        COLORS.secondary,

      textAlign:

        'center',

    },



    bottomNavigation: {

      position:

        'absolute',

      bottom: 0,

      left: 0,

      right: 0,

      minHeight: 68,

      paddingTop: 9,

      backgroundColor:

        COLORS.white,

      borderTopWidth: 1,

      borderTopColor:

        COLORS.border,

      flexDirection:

        'row',

      justifyContent:

        'space-around',

    },



    navigationItem: {

      flex: 1,

      alignItems:

        'center',

      gap: 3,

    },



    activeNavigationText: {

      fontSize: 10,

      fontWeight:

        '700',

      color:

        COLORS.teal,

    },



    navigationText: {

      fontSize: 10,

      color:

        COLORS.secondary,

    },

  });