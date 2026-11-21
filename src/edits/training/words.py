# Caption words for every kept line, in joined-source seconds (IMG_4793 starts at 143.433 s).
# Timings come from two Whisper large-v3 passes (whole clip + each cut on its own) and the
# voice energy scan; spellings are the corrected ones. Writes transcript.json for createEdl.
# Raw ASR: asr/whisper_segments.txt (both clips, own timebases), asr/t4793.json (words).
import json, os

W = {
    'hook': [('KAU', 122.55, 122.68), ('BUKA', 122.68, 122.84), ('HIGHWAY', 122.84, 122.98), ('UNTUK', 122.98, 123.12), ('DIA', 123.12, 123.26), ('TAHAN', 123.34, 123.5)],
    'lineup': [('CENTER', 11.45, 11.70), ('TAK', 11.70, 11.86), ('ADA', 11.86, 12.02), ('IPAN', 12.02, 12.44), ('TAK', 12.44, 12.6), ('ADA', 12.6, 12.74), ('ENGKAU', 12.76, 13.04), ('LAH', 13.04, 13.14), ('CENTER', 13.14, 13.4)],
    'title': [('YANG', 22.64, 22.8), ('NI', 22.8, 22.92), ('KORANG-KORANG', 22.92, 23.28), ('TENGOK', 23.28, 23.54), ('EH', 23.6, 23.68), ('NI', 23.72, 24.0), ('KITA', 24.55, 24.78), ('MAIN', 24.78, 25.08), ('ATTACK', 25.08, 25.38), ('DOUBLE', 25.38, 25.96), ('PIVOT', 25.96, 26.32)],
    'flow': [('BOLA', 34.04, 34.22), ('FLOW', 34.22, 34.46), ('DULU', 34.46, 34.76)],
    'pos45': [('SEBABNYA', 42.0, 42.38), ('DIA', 42.42, 42.64), ('45', 42.64, 43.2)],
    'luar': [('TAPI', 45.8, 46.3), ('KAU', 46.57, 46.82), ('KENA', 46.82, 47.0), ('BERDIRI', 47.0, 47.26), ('KAT', 47.26, 47.36), ('LUAR', 47.36, 47.56), ('NI', 47.56, 47.75)],
    'jangan': [('KAU', 54.0, 54.16), ('JANGAN', 54.16, 54.38), ('BELAKANG', 54.38, 54.76), ('SINI', 54.76, 54.94)],
    'tarik': [('KAU', 56.3, 56.44), ('KENA', 56.44, 56.54), ('BERDIRI', 56.54, 56.72), ('DI', 56.72, 56.8), ('SINI', 56.8, 56.94), ('SEBAB', 56.94, 57.4), ('KITA', 57.4, 57.48), ('TARIK', 57.48, 57.74), ('KELUAR', 57.74, 57.92)],
    'flow3': [('FLOW', 65.75, 65.92), ('FLOW', 65.92, 66.04), ('FLOW', 66.04, 66.16), ('TENGOK', 66.16, 66.4), ('DULU', 66.4, 66.58)],
    'lagi': [('LAGI', 82.1, 82.26), ('LAGI', 82.28, 82.44), ('LAGI', 82.46, 82.62)],
    'switch': [('BILA', 97.21, 97.35), ('DAH', 97.35, 97.71), ('SWITCH', 97.71, 97.99), ('PASTIKAN', 98.09, 98.51), ('SWITCH', 98.51, 98.77)],
    'rebound': [('CUBA', 146.65, 146.87), ('KITA', 146.87, 146.97), ('TRY', 146.97, 147.25), ('REBOUND', 147.25, 147.47)],
    'pivot': [('TAPI', 148.31, 148.67), ('BOLA', 148.67, 148.87), ('TU', 148.87, 149.03), ('BOLA', 149.03, 149.17), ('PIVOT', 149.17, 149.4)],
    'masuk': [('MASUK', 169.67, 170.09)],
    'ikut': [('HAA', 174.43, 174.9), ('PUN', 175.11, 175.41), ('BOLEH', 175.41, 175.67), ('JADI', 175.73, 175.83), ('IKUT', 175.83, 176.25), ('ADA', 176.29, 176.67), ('BANYAK', 176.67, 177.05), ('OPTION', 177.05, 177.3)],
    'improvise': [('IMPROVISE', 178.32, 179.5)],
}

here = os.path.dirname(os.path.abspath(__file__))
# Captions show one chunk at a time: at most 3 words, and a new chunk after any 0.3 s gap.
def chunks(v):
    out, cur = [], []
    for w in v:
        if cur and (len(cur) == 3 or w[1] - cur[-1][2] > 0.3):
            out.append(cur); cur = []
        cur.append(w)
    return out + [cur]

json.dump({'segments': [{'id': f'{k}{i}', 'words': [{'w': w, 's': s, 'e': e} for w, s, e in c]} for k, v in W.items() for i, c in enumerate(chunks(v))]},
          open(os.path.join(here, 'transcript.json'), 'w'), indent=0)
