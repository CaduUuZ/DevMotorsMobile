import streamlit as st
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors
import unicodedata

# --- Função auxiliar ---
def normalizar_texto(texto):
    if pd.isna(texto):
        return ""
    texto = str(texto).lower()
    texto = ''.join(c for c in unicodedata.normalize('NFD', texto) if unicodedata.category(c) != 'Mn')
    return texto.strip()

# --- Interface ---
st.set_page_config(page_title="Recomendador de Exames", page_icon="🧠", layout="wide")
st.title("🧠 Recomendador de Exames por Similaridade de Pacientes")

# --- Carregar dados ---
csv_path = "dados_pacientes_exames_500.csv"
df = pd.read_csv(csv_path)

# --- Limpeza e pré-processamento ---
df["patologia"] = df["patologia"].apply(normalizar_texto)
df["medicamento"] = df["medicamento"].apply(normalizar_texto)

# --- Vetorização TF-IDF com n-grams ---
tfidf_pat = TfidfVectorizer(analyzer='char_wb', ngram_range=(3,5), max_features=300)
tfidf_med = TfidfVectorizer(analyzer='char_wb', ngram_range=(3,5), max_features=300)

pat_vec = tfidf_pat.fit_transform(df["patologia"]).toarray()
med_vec = tfidf_med.fit_transform(df["medicamento"]).toarray()
num_cols = df[["idade"]].values  # Apenas idade como numérica

# --- Matriz final ---
X = np.hstack([num_cols, pat_vec, med_vec])
exames = df["exame_texto"].values

# --- Controle de quantos pacientes semelhantes considerar ---
num_vizinhos = st.slider("Número de pacientes semelhantes a considerar:", 1, 20, 5)

# --- Modelo de vizinhança baseado em cosseno ---
knn = NearestNeighbors(n_neighbors=num_vizinhos, metric='cosine')
knn.fit(X)

# --- Mostrar tabela ---
with st.expander("📋 Ver dados carregados"):
    st.dataframe(df.head(20))

# --- Formulário para novo paciente ---
st.subheader("💡 Recomendar exame para novo paciente")

col1, col2 = st.columns(2)
with col1:
    idade = st.number_input("Idade:", 1, 120, 40)
with col2:
    patologia = st.text_input("Patologia (ex: diabetes, hipertensão, etc.):")
medicamento = st.text_input("Medicamento (ex: metformina, losartana, etc.)")

# --- Quantos exames mostrar ---
num_exames = st.slider("Número de exames recomendados:", 1, 10, 3)

# --- Botão de recomendação ---
if st.button("🔎 Recomendar exames"):
    if patologia.strip() == "" and medicamento.strip() == "":
        st.warning("Por favor, insira pelo menos uma patologia ou medicamento.")
    else:
        # Vetorizar novo paciente
        pat_vec_new = tfidf_pat.transform([normalizar_texto(patologia)]).toarray()
        med_vec_new = tfidf_med.transform([normalizar_texto(medicamento)]).toarray()
        X_new = np.hstack([[idade], pat_vec_new[0], med_vec_new[0]]).reshape(1, -1)

        # Encontrar pacientes semelhantes
        dist, idx = knn.kneighbors(X_new)
        exames_recomendados = pd.Series(exames[idx[0]]).value_counts().head(num_exames)

        # Mostrar resultados
        st.success("🧩 Exames recomendados com base em pacientes semelhantes:")
        st.table(exames_recomendados.rename_axis("Exame").reset_index(name="Frequência"))

        # Mostrar pacientes mais próximos
        st.info("👥 Pacientes semelhantes encontrados:")
        st.dataframe(df.iloc[idx[0]][["id_paciente", "idade", "patologia", "medicamento", "exame_texto"]])
