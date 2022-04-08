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
                `select * from grocery where done = ?;`,
                [doneHeading ? 1 : 0],
                (_, { rows: { _array } }) => setItems(_array)
            );
        });
    }, []);

    const heading = doneHeading ? "Done" : "Add";

    if (items === null || items.length === 0) {
        return null;
    }

    return (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeading}>{heading}</Text>
            {items.map(({ id, done, value, qty, msmt }) => (
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
                        <Text style={{ color: done ? "#fff" : "#000", fontSize: 16, fontWeight: 'bold' }}>{value}</Text>
                        <Text style={{ color: done ? "#fff" : "#000", fontSize: 14, fontWeight: 'bold', marginRight: 10 }}>{qty} {msmt}</Text>
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

export default function Groceries() {
    const [text, setText] = useState(null);
    const [qty, setQty] = useState(null);
    const [msmt, setMsmt] = useState(null);
    const [forceUpdate, forceUpdateId] = useForceUpdate();

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql(
                "create table if not exists grocery (id integer primary key not null, done int, value text,qty text,msmt text);"
            );
        });
    }, []);

    const add = (text, qty, msmt) => {
        // is text empty?
        if (text === null || text === "") {
            return false;
        }

        db.transaction(
            (tx) => {
                tx.executeSql("insert into grocery (done, value,qty,msmt) values (0, ?,?,?)", [text, qty, msmt]);
                tx.executeSql("select * from grocery", [], (_, { rows }) =>
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
                                tx.executeSql(`update grocery set done = 1 where id = ?;`, [
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
                                tx.executeSql(`delete from grocery where id = ?;`, [
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
                                tx.executeSql(`update grocery set done = 0 where id = ?;`, [
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
                                tx.executeSql(`delete from grocery where id = ?;`, [
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
                    onChangeText={(text) => setText(text)}

                    placeholder="Grocery item"
                    style={styles.input}
                    value={text}
                />
                <View style={{ flexDirection: 'row', }}>
                    <TextInput
                        onChangeText={(text) => setQty(text)}
                        keyboardType='numeric'
                        placeholder="Quantity"
                        style={styles.input}
                        value={qty}
                    />
                    <TouchableOpacity style={[styles.msmtButton, { backgroundColor: msmt == 'Litre' ? '#2E8B57' : '#fff' }]}
                        onPress={() => {
                            setMsmt('Litre');
                        }}
                    >
                        <Text style={{ color: msmt == 'Litre' ? '#fff' : '#2E8B57', }}>Litre</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.msmtButton, { backgroundColor: msmt == 'Pkt' ? '#2E8B57' : '#fff' }]}
                        onPress={() => {
                            setMsmt('Pkt');
                        }}
                    >
                        <Text style={{ color: msmt == 'Pkt' ? '#fff' : '#2E8B57', }}>Packet</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.msmtButton, { backgroundColor: msmt == 'Kg' ? '#2E8B57' : '#fff' }]}
                        onPress={() => {
                            setMsmt('Kg');
                        }}
                    >
                        <Text style={{ color: msmt == 'Kg' ? '#fff' : '#2E8B57', }}>KG</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button}
                        onPress={() => {
                            add(text, qty, msmt);
                            setText(null);
                            setQty(null);
                            setMsmt(null);
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
        borderColor: '#2E8B57',
        borderRadius: 4,
        borderWidth: 1,
        flex: 0.3,
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