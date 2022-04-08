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
import Constants from "expo-constants";
import * as SQLite from "expo-sqlite";
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

function Items() {
    const [items, setItems] = useState(null);

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql(
                `select * from passwords`, [],
                (_, { rows: { _array } }) => setItems(_array)
            );
        });
    }, []);


    if (items === null || items.length === 0) {
        return null;
    }

    return (
        <View style={styles.sectionContainer}>

            {items.map((i) => (
                <TouchableOpacity
                    key={i.id}
                    style={{
                        backgroundColor: "#f0f0f0",
                        padding: 8,
                        marginBottom: 5,
                        borderRadius: 5,
                    }}
                >
                    <Text style={{ color: "#000" }}>{i.website}-{i.password}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

export default function Passwords() {
    const [text, setText] = useState(null);
    const [website, setWebsite] = useState(null);
    const [username, setUsername] = useState(null);
    const [forceUpdate, forceUpdateId] = useForceUpdate();

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql(
                "create table if not exists passwords (id integer primary key not null, website text,username text, password text);"
            );
        });
    }, []);

    const add = (website, username, password) => {
        // is text empty?
        if (password === null || password === "") {
            return false;
        }

        db.transaction(
            (tx) => {
                tx.executeSql("insert into passwords (website,username, password) values (?,?, ?)", [website, username, password]);
                tx.executeSql("select * from passwords", [], (_, { rows }) =>
                    console.log(JSON.stringify(rows))
                );
            },
            null,
            forceUpdate
        );
    };

    return (
        <SafeAreaView style={styles.container}>

            {Platform.OS === "web" ? (
                <View
                    style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                >
                    <Text style={styles.heading}>
                        Expo SQlite is not supported on web!
                    </Text>
                </View>
            ) : (
                <>

                    <ScrollView style={styles.listArea}>
                        <Items
                            key={`forceupdate-todo-${forceUpdateId}`}
                        />

                    </ScrollView>
                    <View style={{ height: 120 }}>
                        <View style={{ flexDirection: 'row', }}>
                            <TextInput
                                onChangeText={(text) => setWebsite(text)}
                                placeholder="Website"
                                style={styles.input}
                                value={website}
                            />
                            <TextInput
                                onChangeText={(text) => setUsername(text)}
                                placeholder="Username"
                                style={styles.input}
                                value={username}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', }}>
                            <TextInput
                                onChangeText={(text) => setText(text)}
                                placeholder="Password"
                                style={styles.input}
                                value={text}
                            />
                            <TouchableOpacity style={styles.button}
                                onPress={() => {
                                    add(website, username, text);
                                    setText(null);
                                    setWebsite(null);
                                    setUsername(null);
                                    Keyboard.dismiss();
                                }}
                            >
                                <Text style={{ color: '#fff', }}>Save</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </>
            )}
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
        marginHorizontal: 10,
        marginVertical: 5,
        padding: 8,
    },
    button: {
        borderColor: "#4630eb",
        backgroundColor: "#4630eb",
        borderRadius: 4,
        borderWidth: 1,
        flex: 0.2,
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