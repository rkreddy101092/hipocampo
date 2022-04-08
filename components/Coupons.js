import React, { useState, useEffect } from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import * as SQLite from "expo-sqlite";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Keyboard } from "react-native";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";

function openDatabase() {
    if (Platform.OS === "web") {
        return {
            transaction: () => {
                return {
                    executeSql: () => { },
                };
            },
        };
    }

    const db = SQLite.openDatabase("db.db");
    return db;
}

const db = openDatabase();

function Items({ done: doneHeading, onPressItem, onDeleteItem }) {
    const [items, setItems] = useState(null);

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql(
                `select * from coupons where done = ?;`,
                [doneHeading ? 1 : 0],
                (_, { rows: { _array } }) => setItems(_array)
            );
        });
    }, []);

    const heading = doneHeading ? "Redeemed/Expired" : "Active";

    if (items === null || items.length === 0) {
        return null;
    }

    return (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeading}>{heading}</Text>
            {items.map(({ id, done, merchant, coupon, expiry }) => (
                <View style={{
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    <TouchableOpacity
                        key={id}
                        onPress={() => onPressItem && onPressItem(id)}
                        style={{
                            backgroundColor: done ? "#1c9963" : "#f0f0f0",
                            justifyContent: 'space-between',
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 8,
                            marginBottom: 5,
                            borderRadius: 5,
                            flex: 0.94,
                        }}
                    >
                        <View>
                            <Text style={{ color: done ? "#fff" : "#000", fontSize: 16, marginRight: 10 }}>{merchant}</Text>
                            <Text style={{ color: done ? "#fff" : "#000", fontSize: 12, marginRight: 10 }}>{expiry}</Text>
                        </View>
                        <Text style={{ color: done ? "#fff" : "#000", fontSize: 18, fontWeight: 'bold' }}>{coupon}</Text>


                    </TouchableOpacity>

                    <TouchableOpacity style={{
                        backgroundColor: "#fff",
                        justifyContent: 'center',
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 5,
                        marginBottom: 5,
                        marginLeft: 5,
                        borderRadius: 5,
                        flex: 0.06,
                    }} onPress={() => onDeleteItem && onDeleteItem(id)}>

                        <MaterialCommunityIcons name="delete" color={'red'} size={20} />
                    </TouchableOpacity>

                </View>
            ))}
        </View>
    );
}

export default function Coupons() {
    const [merchant, setMerchant] = useState(null);
    const [coupon, setCoupon] = useState(null);
    const [expiry, setExpiry] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [forceUpdate, forceUpdateId] = useForceUpdate();

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql(
                "create table if not exists coupons (id integer primary key not null, done int, merchant text,coupon text,expiry text);"
            );
        });
    }, []);

    const add = (merchant, coupon, expiry) => {

        db.transaction(
            (tx) => {
                tx.executeSql("insert into coupons (done, merchant,coupon,expiry) values (0, ?,?,?)", [merchant, coupon, expiry]);
                tx.executeSql("select * from coupons", [], (_, { rows }) =>
                    console.log(JSON.stringify(rows))
                );
            },
            null,
            forceUpdate
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.listArea}>
                <Items
                    key={`forceupdate-todo-${forceUpdateId}`}
                    done={false}
                    onPressItem={(id) =>
                        db.transaction(
                            (tx) => {
                                tx.executeSql(`update coupons set done = 1 where id = ?;`, [
                                    id,
                                ]);
                            },
                            null,
                            forceUpdate
                        )
                    }

                    onDeleteItem={(id) =>
                        db.transaction(
                            (tx) => {
                                tx.executeSql(`delete from coupons where id = ?;`, [
                                    id,
                                ]);
                            },
                            null,
                            forceUpdate
                        )
                    }
                />
                <Items
                    done
                    key={`forceupdate-done-${forceUpdateId}`}
                    onPressItem={(id) =>
                        db.transaction(
                            (tx) => {
                                tx.executeSql(`update coupons set done = 0 where id = ?;`, [
                                    id,
                                ]);
                            },
                            null,
                            forceUpdate
                        )
                    }
                    onDeleteItem={(id) =>
                        db.transaction(
                            (tx) => {
                                tx.executeSql(`delete from coupons where id = ?;`, [
                                    id,
                                ]);
                            },
                            null,
                            forceUpdate
                        )
                    }
                />
            </ScrollView>

            <View style={{ height: 120 }}>
                <TextInput
                    onChangeText={(text) => setMerchant(text)}

                    placeholder="Merchant Name"
                    style={styles.input}
                    value={merchant}
                />
                <View style={{ flexDirection: 'row', }}>
                    <TextInput
                        onChangeText={(text) => setCoupon(text)}
                        placeholder="Coupon"
                        style={styles.input}
                        value={coupon}
                    />
                    {showPicker &&
                        <RNDateTimePicker value={expiry} onChange={(event, date) => {
                            setExpiry(date);
                            setShowPicker(false);
                        }} />}
                    <TouchableOpacity style={[styles.msmtButton, { backgroundColor: '#fff' }]}
                        onPress={() => {
                            setShowPicker(true);
                        }}
                    >
                        <Text style={{ color: '#000', }}>{expiry.toDateString()}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button}
                        onPress={() => {
                            add(merchant, coupon, expiry.toDateString());
                            setMerchant(null);
                            setCoupon(null);
                            setExpiry(new Date());
                            Keyboard.dismiss();
                        }}
                    >
                        <Text style={{ color: '#fff', }}>Save</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </SafeAreaView>
    );
}

function useForceUpdate() {
    const [value, setValue] = useState(0);
    return [() => setValue(value + 1), value];
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        flex: 1,
    },
    heading: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
    },
    flexRow: {
        flexDirection: "row",
    },
    input: {
        borderColor: "#4630eb",
        borderRadius: 4,
        borderWidth: 1,
        flex: 1,
        height: 48,
        marginHorizontal: 16,
        marginVertical: 5,
        padding: 8,
    },
    msmtButton: {
        borderColor: '#4630eb',
        borderRadius: 4,
        borderWidth: 1,
        flex: 1,
        height: 48,
        marginVertical: 5,
        marginRight: 16,
        alignItems: 'center',
        justifyContent: 'center'
    },
    button: {
        borderColor: "#4630eb",
        backgroundColor: "#4630eb",
        borderRadius: 4,
        borderWidth: 1,
        flex: 0.4,
        height: 48,
        marginVertical: 5,
        marginRight: 16,
        alignItems: 'center',
        justifyContent: 'center'
    },
    listArea: {
        backgroundColor: "#fff",
        flex: 1,
        paddingTop: 16,
    },
    sectionContainer: {
        marginBottom: 16,
        marginHorizontal: 16,
    },
    sectionHeading: {
        fontSize: 18,
        marginBottom: 8,
    },
});